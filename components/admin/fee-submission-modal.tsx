"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, DollarSign, AlertCircle, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface FeeSubmissionModalProps {
  userType: "agent" | "consultancy"
  onSuccess?: () => void
}

export function FeeSubmissionModal({ userType, onSuccess }: FeeSubmissionModalProps) {
  const [formData, setFormData] = useState({
    admission_id: "",
    amount_received: "",
    payment_mode: "upi",
    payment_date: new Date().toISOString().split("T")[0],
    transaction_id: "",
    payment_proofs: [] as File[],
    notes: "",
  })

  const [loading, setLoading] = useState(false)
  const [admissions, setAdmissions] = useState<any[]>([])
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadAdmissions()
  }, [])

  const loadAdmissions = async () => {
    const { data, error } = await supabase
      .from('admissions')
      .select(`
        id, 
        student_name, 
        total_fee,
        fee_paid,
        university_courses (
           master_courses (name)
        )
      `)
    if (data) setAdmissions(data)
  }

  const handleAdmissionSelect = (admissionId: string) => {
    const admission = admissions.find(a => a.id === admissionId)
    if (admission) {
      setSelectedAdmission(admission)
      setFormData({
        ...formData,
        admission_id: admissionId,
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, payment_proofs: Array.from(e.target.files) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.admission_id || !formData.amount_received) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Upload proofs to storage
      const proofUrls: string[] = []
      for (const file of formData.payment_proofs) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${formData.admission_id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Media')
          .upload(`fee_receipts/${fileName}`, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('Media')
          .getPublicUrl(`fee_receipts/${fileName}`)

        proofUrls.push(publicUrl)
      }

      // 2. Insert into fee_submissions
      const { error: insertError } = await supabase
        .from('fee_submissions')
        .insert({
          admission_id: formData.admission_id,
          submitted_by_id: user?.id,
          amount_received: parseFloat(formData.amount_received),
          payment_mode: formData.payment_mode,
          payment_date: formData.payment_date,
          transaction_id: formData.transaction_id,
          proof_urls: proofUrls,
          notes: formData.notes,
          status: 'pending'
        })

      if (insertError) throw insertError

      alert('Fee submission successful! Waiting for admin approval.')
      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to submit fee:", error)
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const amountRemaining = selectedAdmission
    ? selectedAdmission.total_fee - (selectedAdmission.fee_paid || 0)
    : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1 scrollbar-hide">
      <div>
        <h3 className="text-xl font-bold font-heading flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Submit Fee Receipt
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload payment proof for {userType} fee collection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Admission Info */}
        <div className="space-y-4">
          <Card className="p-4 border-muted shadow-sm">
            <Label className="mb-2 block font-semibold text-sm">Select Student Admission *</Label>
            <Select value={formData.admission_id} onValueChange={handleAdmissionSelect}>
              <SelectTrigger className="w-full bg-muted/20">
                <SelectValue placeholder="Search student name or ID" />
              </SelectTrigger>
              <SelectContent>
                {admissions.map((admission) => (
                  <SelectItem key={admission.id} value={admission.id}>
                    {admission.student_name} ({admission.id.slice(0, 8)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAdmission && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course:</span>
                  <span className="font-semibold">{selectedAdmission.university_courses?.master_courses?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Fee:</span>
                  <span className="font-bold">₹{selectedAdmission.total_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-semibold text-green-600">₹{(selectedAdmission.fee_paid || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-primary/10 flex justify-between">
                  <span className="font-semibold">Remaining:</span>
                  <span className="font-bold text-amber-600">₹{amountRemaining.toLocaleString()}</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4 border-muted shadow-sm space-y-4">
            <div>
              <Label htmlFor="proofs" className="font-semibold text-sm">Upload Payment Proof(s) *</Label>
              <div className="mt-2 group relative border-2 border-dashed border-muted rounded-xl p-6 transition-all hover:border-primary/50 hover:bg-primary/5">
                <Input
                  id="proofs"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  required
                />
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Click or drag to upload</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</p>
                </div>
              </div>

              {formData.payment_proofs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.payment_proofs.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-xs border border-muted">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="flex-1 truncate font-medium">{file.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{(file.size / 1024).toFixed(0)} KB</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Payment Details */}
        <div className="space-y-4">
          <Card className="p-4 border-muted shadow-sm space-y-4">
            <h4 className="font-bold text-sm border-b pb-2">Transaction Details</h4>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="amount" className="font-semibold">Amount Received (₹) *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount_received}
                    onChange={(e) => setFormData({ ...formData, amount_received: e.target.value })}
                    className="pl-7 bg-muted/20"
                    placeholder="e.g. 50000"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="payment_mode" className="font-semibold">Payment Mode *</Label>
                <Select value={formData.payment_mode} onValueChange={(value) => setFormData({ ...formData, payment_mode: value })}>
                  <SelectTrigger className="mt-1 bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI / GPay / PhonePe</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer (NEFT/RTGS)</SelectItem>
                    <SelectItem value="cash">Cash Collection</SelectItem>
                    <SelectItem value="cheque">Cheque Deposit</SelectItem>
                    <SelectItem value="card">Card Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="payment_date" className="font-semibold">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="mt-1 bg-muted/20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transaction_id" className="font-semibold">Txn ID (Ref No)</Label>
                  <Input
                    id="transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    placeholder="Ref #1234"
                    className="mt-1 bg-muted/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="font-semibold text-sm">Internal Note</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Mention bank name or special instructions"
                  className="mt-1 bg-muted/20"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Warning */}
          {selectedAdmission && formData.amount_received && Number(formData.amount_received) > amountRemaining && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[13px]">
                <p className="font-bold text-amber-900">Warning</p>
                <p className="text-amber-700 leading-tight">
                  Entered amount is ₹{(Number(formData.amount_received) - amountRemaining).toLocaleString()} higher than the balance fee.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-background pb-2">
        <Button
          type="button"
          variant="ghost"
          className="flex-1 hover:bg-muted font-bold"
          onClick={() => onSuccess?.()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
          disabled={loading || !formData.admission_id}
        >
          {loading ? "Uploading & Submitting..." : "Submit Receipt for Review"}
        </Button>
      </div>
    </form>
  )
}
