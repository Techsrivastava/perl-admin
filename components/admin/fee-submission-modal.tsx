"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, DollarSign, AlertCircle } from "lucide-react"

interface FeeSubmissionModalProps {
  userType: "agent" | "consultancy"
  onSuccess?: () => void
}

export function FeeSubmissionModal({ userType, onSuccess }: FeeSubmissionModalProps) {
  const [formData, setFormData] = useState({
    admission_id: "",
    student_name: "",
    amount_received: "",
    payment_mode: "upi",
    payment_date: new Date().toISOString().split("T")[0],
    transaction_id: "",
    payment_proofs: [] as File[],
    notes: "",
  })

  const [loading, setLoading] = useState(false)
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null)

  // Mock admissions list
  const admissions = [
    { id: "ADM001", student_name: "Rahul Sharma", course: "B.Tech CS", agreed_fee: 480000 },
    { id: "ADM002", student_name: "Priya Singh", course: "MBA", agreed_fee: 350000 },
    { id: "ADM003", student_name: "Amit Kumar", course: "BCA", agreed_fee: 120000 },
  ]

  const handleAdmissionSelect = (admissionId: string) => {
    const admission = admissions.find(a => a.id === admissionId)
    if (admission) {
      setSelectedAdmission(admission)
      setFormData({
        ...formData,
        admission_id: admissionId,
        student_name: admission.student_name,
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
    setLoading(true)

    try {
      const response = await fetch("/api/fee-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to submit fee:", error)
    } finally {
      setLoading(false)
    }
  }

  const amountDifference = selectedAdmission && formData.amount_received
    ? Number(formData.amount_received) - selectedAdmission.agreed_fee
    : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Submit Fee ({userType === "agent" ? "Agent" : "Consultancy"})
        </h3>
        <p className="text-sm text-muted-foreground">
          Submit payment details for admission fee received from student
        </p>
      </div>

      {/* Admission Selection */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Select Admission</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="admission">Admission ID / Student *</Label>
            <Select value={formData.admission_id} onValueChange={handleAdmissionSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select admission" />
              </SelectTrigger>
              <SelectContent>
                {admissions.map((admission) => (
                  <SelectItem key={admission.id} value={admission.id}>
                    {admission.id} - {admission.student_name} ({admission.course})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAdmission && (
            <div className="p-3 bg-muted rounded text-sm space-y-1">
              <p><strong>Student:</strong> {selectedAdmission.student_name}</p>
              <p><strong>Course:</strong> {selectedAdmission.course}</p>
              <p><strong>Agreed Fee:</strong> ₹{selectedAdmission.agreed_fee.toLocaleString()}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Details */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Payment Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount Received (₹) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount_received}
              onChange={(e) => setFormData({ ...formData, amount_received: e.target.value })}
              placeholder="e.g., 480000"
              required
            />
            {amountDifference !== 0 && selectedAdmission && (
              <p className={`text-xs mt-1 ${amountDifference > 0 ? "text-green-600" : "text-amber-600"}`}>
                {amountDifference > 0 ? "+" : ""}₹{Math.abs(amountDifference).toLocaleString()} difference from agreed fee
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="payment_mode">Payment Mode *</Label>
            <Select value={formData.payment_mode} onValueChange={(value) => setFormData({ ...formData, payment_mode: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer / NEFT / RTGS</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="dd">Demand Draft</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="transaction_id">Transaction ID / Reference No</Label>
            <Input
              id="transaction_id"
              value={formData.transaction_id}
              onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              placeholder="e.g., TXN123456789"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="proofs">Upload Payment Proof(s) * (Max 5MB each)</Label>
            <div className="mt-2">
              <Input
                id="proofs"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileChange}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upload receipt, screenshot, or bank statement as proof
            </p>
            {formData.payment_proofs.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.payment_proofs.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Upload className="w-3 h-3" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information about this payment"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Warning if difference exists */}
      {amountDifference !== 0 && selectedAdmission && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Amount Difference Detected</p>
            <p className="text-amber-700">
              The amount received is {amountDifference > 0 ? "more" : "less"} than the agreed fee. 
              System will flag this for review.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading || !formData.admission_id}>
          {loading ? "Submitting..." : "Submit for Approval"}
        </Button>
      </div>
    </form>
  )
}
