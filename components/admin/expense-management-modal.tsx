"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Receipt, Upload } from "lucide-react"

interface ExpenseManagementModalProps {
  ownerType: "consultancy" | "super_admin"
  ownerId?: string
  onSuccess?: () => void
}

export function ExpenseManagementModal({ ownerType, ownerId, onSuccess }: ExpenseManagementModalProps) {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    payment_mode: "cash",
    proof_files: [] as File[],
    notes: "",
    status: "verified",
  })

  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, proof_files: Array.from(e.target.files) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          owner_type: ownerType,
          owner_id: ownerId || "system",
        }),
      })

      if (response.ok) {
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to add expense:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Add Expense
        </h3>
        <p className="text-sm text-muted-foreground">
          Record a new expense for {ownerType === "super_admin" ? "System" : "Consultancy"}
        </p>
      </div>

      {/* Expense Details */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Expense Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Rent / Lease</SelectItem>
                <SelectItem value="salary">Salary / Wages</SelectItem>
                <SelectItem value="travel">Travel & Transport</SelectItem>
                <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                <SelectItem value="utilities">Utilities (Electric, Water, Internet)</SelectItem>
                <SelectItem value="office_supplies">Office Supplies</SelectItem>
                <SelectItem value="software">Software / Subscriptions</SelectItem>
                <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                <SelectItem value="legal">Legal & Professional Fees</SelectItem>
                <SelectItem value="meals">Meals & Entertainment</SelectItem>
                <SelectItem value="training">Training & Development</SelectItem>
                <SelectItem value="misc">Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Expense Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Office Rent for January"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g., 25000"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="payment_mode">Payment Mode *</Label>
            <Select value={formData.payment_mode} onValueChange={(value) => setFormData({ ...formData, payment_mode: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="wallet">Digital Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="proofs">Upload Proof (Bill/Receipt) *</Label>
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
              Upload bill, invoice, or receipt as proof of expense
            </p>
            {formData.proof_files.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.proof_files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Upload className="w-3 h-3" />
                    <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
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
              placeholder="Any additional details about this expense"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Summary */}
      {formData.amount && (
        <Card className="p-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expense</p>
              <p className="text-2xl font-bold text-primary">₹{Number(formData.amount).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="text-sm font-semibold capitalize">{formData.category.replace(/_/g, " ")}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Footer */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button type="submit" variant="secondary" className="flex-1" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Saving..." : "Save & Verify"}
        </Button>
      </div>
    </form>
  )
}
