"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Receipt, Upload, Loader2, FileText, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface ExpenseManagementModalProps {
  ownerType: "consultancy" | "super_admin"
  ownerId?: string
  onSuccess?: () => void
}

export function ExpenseManagementModal({ ownerType, ownerId, onSuccess }: ExpenseManagementModalProps) {
  const [formData, setFormData] = useState({
    category: "office_supplies",
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    payment_mode: "cash",
    proof_files: [] as File[],
    notes: "",
    status: "verified",
  })

  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, proof_files: Array.from(e.target.files) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.amount) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Upload proofs
      const proofUrls: string[] = []
      for (const file of formData.proof_files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `EXP_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('Media')
          .upload(`expenses/${fileName}`, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('Media')
          .getPublicUrl(`expenses/${fileName}`)

        proofUrls.push(publicUrl)
      }

      // 2. Insert into expenses
      const { error } = await supabase
        .from('expenses')
        .insert({
          title: formData.title,
          category: formData.category,
          amount: parseFloat(formData.amount),
          date: formData.date,
          payment_mode: formData.payment_mode,
          notes: formData.notes,
          attachment_urls: proofUrls,
          status: formData.status,
          owner_type: ownerType,
          owner_id: ownerId || user?.id
        })

      if (error) throw error

      alert('Expense recorded successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to add expense:", error)
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-0 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Details */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" />
              Essential Info
            </h4>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Expense Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Office Rent, Marketing Ad Spends..."
                className="h-11 bg-muted/20 border-muted"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bold text-sm">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="h-11 bg-muted/20 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent / Lease</SelectItem>
                    <SelectItem value="salary">Salary / Wages</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="software">Software / SaaS</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="office_supplies">Office Supplies</SelectItem>
                    <SelectItem value="misc">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm">Amount (₹) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="h-11 bg-muted/20 border-muted font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bold text-sm">Spend Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-11 bg-muted/20 border-muted"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm">Payment Mode</Label>
                <Select value={formData.payment_mode} onValueChange={(v) => setFormData({ ...formData, payment_mode: v })}>
                  <SelectTrigger className="h-11 bg-muted/20 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI / Online</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Corporate Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Audit & Proofs */}
        <div className="space-y-6 border-l pl-8 border-muted">
          <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <div className="w-1 h-1 bg-primary rounded-full" />
            Audit & Proofs
          </h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-sm">Internal Note</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add some context for this spend..."
                className="bg-muted/20 border-muted text-sm"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Attachment (Receipt/Invoice) *</Label>
              <div className="group relative border-2 border-dashed border-muted rounded-xl p-6 transition-all hover:border-primary/50 hover:bg-primary/5">
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  required
                />
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  <p className="text-xs font-bold text-muted-foreground">CLICK TO UPLOAD</p>
                </div>
              </div>

              {formData.proof_files.length > 0 && (
                <div className="space-y-1 pt-2">
                  {formData.proof_files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/40 rounded border text-[10px] font-bold">
                      <FileText className="w-3 h-3 text-primary" />
                      <span className="truncate flex-1">{file.name}</span>
                      <Badge variant="outline" className="text-[8px]">{(file.size / 1024).toFixed(0)}KB</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t mt-4">
        <Button type="button" variant="ghost" className="font-bold" onClick={() => onSuccess?.()}>Discard</Button>
        <Button
          type="submit"
          className="h-12 px-10 font-black shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {loading ? "Saving Record..." : "Confirm & Save Entry"}
        </Button>
      </div>
    </form>
  )
}
