"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, AlertTriangle, TrendingUp, TrendingDown, RefreshCcw, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase"

interface WalletAdjustmentModalProps {
  onSuccess?: () => void
}

export function WalletAdjustmentModal({ onSuccess }: WalletAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    wallet_owner_type: "",
    wallet_owner_id: "",
    direction: "credit",
    amount: "",
    purpose: "topup",
    notes: "",
  })

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [owners, setOwners] = useState<any[]>([])
  const [selectedWallet, setSelectedWallet] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    if (formData.wallet_owner_type) {
      loadOwners()
    }
  }, [formData.wallet_owner_type])

  const loadOwners = async () => {
    try {
      setFetching(true)
      let query = supabase.from(
        formData.wallet_owner_type === 'university' ? 'universities' :
          formData.wallet_owner_type === 'consultancy' ? 'consultancies' : 'agents'
      ).select('id, name, wallet_balance')

      const { data, error } = await query
      if (error) throw error
      setOwners(data || [])
    } catch (err: any) {
      console.error("Error loading owners:", err)
    } finally {
      setFetching(false)
    }
  }

  const handleWalletSelect = (id: string) => {
    const owner = owners.find(o => o.id === id)
    setSelectedWallet(owner)
    setFormData({ ...formData, wallet_owner_id: id })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.wallet_owner_id || !formData.amount || !formData.notes) return
    setLoading(true)

    try {
      // 1. Create Ledger Entry (Trigger handles update_wallet)
      const { error } = await supabase.from('ledger').insert({
        entity_id: formData.wallet_owner_id,
        entity_type: formData.wallet_owner_type,
        transaction_type: formData.direction,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        description: `Manual Adjustment: ${formData.notes}`,
        reference_type: 'manual_adjustment'
      })

      if (error) throw error

      alert('Wallet adjusted successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to adjust wallet:", error)
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-8 animate-in fade-in zoom-in-95">
      <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
        <div className="text-sm">
          <p className="font-bold text-amber-900 leading-tight">Privileged Action Required</p>
          <p className="text-amber-700 mt-1 text-xs opacity-80">
            Manual adjustments bypass standard billing flows. All entries are non-reversible and recorded for audit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 1: Target Selector */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" />
              Select Destination
            </h4>

            <div className="space-y-3">
              <Label className="font-bold text-sm">Target Entity Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {['university', 'consultancy', 'agent'].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.wallet_owner_type === type ? 'default' : 'outline'}
                    className="capitalize text-xs font-bold h-10"
                    onClick={() => {
                      setFormData({ ...formData, wallet_owner_type: type, wallet_owner_id: '' });
                      setSelectedWallet(null);
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {formData.wallet_owner_type && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <Label className="font-bold text-sm">Select {formData.wallet_owner_type}</Label>
                <Select value={formData.wallet_owner_id} onValueChange={handleWalletSelect}>
                  <SelectTrigger className="h-12 bg-muted/20 border-muted">
                    <SelectValue placeholder={`Search ${formData.wallet_owner_type}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {fetching ? (
                      <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                    ) : owners.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedWallet && (
              <Card className="p-5 bg-primary/5 border-primary/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Balance</p>
                    <p className="text-2xl font-black text-primary">₹{selectedWallet.wallet_balance?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Step 2: Configuration */}
        <div className="space-y-6 border-l pl-8 border-muted">
          <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <div className="w-1 h-1 bg-primary rounded-full" />
            Configuration
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-bold text-sm">Action Type</Label>
                <div className="flex p-1 bg-muted rounded-lg gap-1">
                  <Button
                    type="button"
                    className={`flex-1 h-9 text-xs font-bold transition-all ${formData.direction === 'credit' ? 'bg-white text-green-600 shadow-sm' : 'bg-transparent text-muted-foreground hover:text-black'}`}
                    onClick={() => setFormData({ ...formData, direction: 'credit' })}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" /> Credit
                  </Button>
                  <Button
                    type="button"
                    className={`flex-1 h-9 text-xs font-bold transition-all ${formData.direction === 'debit' ? 'bg-white text-red-600 shadow-sm' : 'bg-transparent text-muted-foreground hover:text-black'}`}
                    onClick={() => setFormData({ ...formData, direction: 'debit' })}
                  >
                    <TrendingDown className="w-3 h-3 mr-1" /> Debit
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm">Amount (₹)</Label>
                <Input
                  type="number"
                  className="h-11 bg-muted/20 border-muted font-bold"
                  value={formData.amount}
                  placeholder="0.00"
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Adjustment Purpose</Label>
              <Select value={formData.purpose} onValueChange={(v) => setFormData({ ...formData, purpose: v })}>
                <SelectTrigger className="h-11 bg-muted/20 border-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topup">Manual Topup / Wallet Loading</SelectItem>
                  <SelectItem value="refund">Student Refund Processing</SelectItem>
                  <SelectItem value="correction">Balance Discrepancy Correction</SelectItem>
                  <SelectItem value="bonus">Performance Bonus / Incentive</SelectItem>
                  <SelectItem value="penalty">Penalty / Fine Recovery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Audit Narrative *</Label>
              <Textarea
                className="bg-muted/20 border-muted text-sm"
                rows={3}
                placeholder="Explain the necessity of this adjustment for manual audit logs..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCcw className="w-4 h-4" />
          <span className="text-xs font-medium italic">Changes will reflect instantly across all reports.</span>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" className="font-bold" onClick={() => onSuccess?.()}>Discard</Button>
          <Button
            type="submit"
            className={`font-black px-8 h-12 shadow-lg ${formData.direction === 'credit' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}
            disabled={loading || !formData.wallet_owner_id || !formData.amount}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirm & Commit
          </Button>
        </div>
      </div>
    </form>
  )
}
