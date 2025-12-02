"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface WalletAdjustmentModalProps {
  onSuccess?: () => void
}

export function WalletAdjustmentModal({ onSuccess }: WalletAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    wallet_owner_type: "",
    wallet_owner_id: "",
    direction: "credit",
    amount: "",
    reason: "",
    notes: "",
    proof_attachment: null as File | null,
  })

  const [loading, setLoading] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<any>(null)

  // Mock wallet data
  const wallets = {
    consultancy: [
      { id: "CNS001", name: "Global Education Consultants", balance: 450000 },
      { id: "CNS002", name: "Future Path Consultancy", balance: 320000 },
    ],
    university: [
      { id: "UNI001", name: "Delhi University", balance: 2500000 },
      { id: "UNI002", name: "Mumbai University", balance: 1800000 },
    ],
    agent: [
      { id: "AGT001", name: "Rajesh Kumar (Agent)", balance: 45000 },
      { id: "AGT002", name: "Priya Singh (Agent)", balance: 32000 },
    ],
  }

  const handleWalletTypeChange = (type: string) => {
    setFormData({ ...formData, wallet_owner_type: type, wallet_owner_id: "" })
    setSelectedWallet(null)
  }

  const handleWalletSelect = (id: string) => {
    const allWallets = [...wallets.consultancy, ...wallets.university, ...wallets.agent]
    const wallet = allWallets.find(w => w.id === id)
    setSelectedWallet(wallet)
    setFormData({ ...formData, wallet_owner_id: id })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/wallets/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to adjust wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  const newBalance = selectedWallet && formData.amount
    ? formData.direction === "credit"
      ? selectedWallet.balance + Number(formData.amount)
      : selectedWallet.balance - Number(formData.amount)
    : null

  const isDebitValid = formData.direction === "debit" && selectedWallet && formData.amount
    ? Number(formData.amount) <= selectedWallet.balance
    : true

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Wallet Adjustment / Top-up
        </h3>
        <p className="text-sm text-muted-foreground">
          Manually credit or debit wallet balance (Requires Super Admin permission)
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900">High-Risk Operation</p>
          <p className="text-amber-700">
            This action will directly affect wallet balances. All adjustments are logged and audited. 
            Provide clear reason and attach proof if available.
          </p>
        </div>
      </div>

      {/* Wallet Selection */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Select Wallet</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="wallet_type">Wallet Owner Type *</Label>
            <Select value={formData.wallet_owner_type} onValueChange={handleWalletTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultancy">Consultancy</SelectItem>
                <SelectItem value="university">University</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.wallet_owner_type && (
            <div>
              <Label htmlFor="wallet_owner">Select Wallet *</Label>
              <Select value={formData.wallet_owner_id} onValueChange={handleWalletSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets[formData.wallet_owner_type as keyof typeof wallets]?.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name} - Current Balance: ₹{wallet.balance.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedWallet && (
            <div className="p-3 bg-muted rounded">
              <p className="text-sm font-semibold mb-1">{selectedWallet.name}</p>
              <p className="text-lg font-bold text-primary">
                Current Balance: ₹{selectedWallet.balance.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Adjustment Details */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Adjustment Details</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="direction">Direction *</Label>
            <Select value={formData.direction} onValueChange={(value) => setFormData({ ...formData, direction: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Credit (Add Money)</span>
                  </div>
                </SelectItem>
                <SelectItem value="debit">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span>Debit (Deduct Money)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g., 50000"
              required
            />
            {!isDebitValid && (
              <p className="text-xs text-red-600 mt-1">
                Insufficient balance. Available: ₹{selectedWallet?.balance.toLocaleString()}
              </p>
            )}
          </div>

          {newBalance !== null && isDebitValid && (
            <div className={`p-3 rounded border ${
              formData.direction === "credit" ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
            }`}>
              <p className="text-sm font-semibold mb-1">
                {formData.direction === "credit" ? "New Balance After Credit:" : "New Balance After Debit:"}
              </p>
              <p className="text-lg font-bold">₹{newBalance.toLocaleString()}</p>
            </div>
          )}

          <Separator />

          <div>
            <Label htmlFor="reason">Reason for Adjustment *</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="correction">Balance Correction</SelectItem>
                <SelectItem value="topup">Manual Top-up</SelectItem>
                <SelectItem value="penalty">Penalty / Deduction</SelectItem>
                <SelectItem value="bonus">Bonus / Incentive</SelectItem>
                <SelectItem value="settlement">Settlement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Detailed Notes *</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Provide detailed explanation for this adjustment (Required for audit trail)"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="proof">Attach Proof (Optional)</Label>
            <Input
              id="proof"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFormData({ ...formData, proof_attachment: e.target.files?.[0] || null })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload supporting document or approval letter
            </p>
          </div>
        </div>
      </Card>

      {/* Audit Info */}
      <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
        <p><strong>Audit Trail:</strong> This adjustment will be logged with timestamp, admin user ID, wallet details, and all entered information.</p>
      </div>

      {/* Footer */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={loading || !selectedWallet || !formData.amount || !isDebitValid}
        >
          {loading ? "Processing..." : "Confirm Adjustment"}
        </Button>
      </div>
    </form>
  )
}
