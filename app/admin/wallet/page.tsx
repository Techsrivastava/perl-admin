"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, TrendingUp, TrendingDown, Settings, Wallet, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { WalletAdjustmentModal } from "@/components/admin/wallet-adjustment-modal"
import { createClient } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

export default function WalletPage() {
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)
  const [walletSummary, setWalletSummary] = useState({
    university_total: 0,
    consultancy_total: 0,
    agent_total: 0,
    system_total: 0,
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    try {
      setLoading(true)

      // 1. Fetch Summary Totals (Aggregating client side for simplicity, ideally a RPC or View)
      const { data: uniData } = await supabase.from('universities').select('wallet_balance')
      const { data: consData } = await supabase.from('consultancies').select('wallet_balance')
      const { data: agentData } = await supabase.from('agents').select('wallet_balance')

      const uniTotal = (uniData || []).reduce((sum, u) => sum + (u.wallet_balance || 0), 0)
      const consTotal = (consData || []).reduce((sum, c) => sum + (c.wallet_balance || 0), 0)
      const agentTotal = (agentData || []).reduce((sum, a) => sum + (a.wallet_balance || 0), 0)

      setWalletSummary({
        university_total: uniTotal,
        consultancy_total: consTotal,
        agent_total: agentTotal,
        system_total: uniTotal + consTotal + agentTotal // Example logic
      })

      // 2. Fetch Transactions (Ledger)
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (ledgerError) throw ledgerError
      setTransactions(ledgerData || [])

    } catch (error: any) {
      console.error('Error loading wallet data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            Wallet & Ledger
          </h1>
          <p className="text-muted-foreground mt-1">Monitor digital balances and financial flows</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                <Settings className="w-4 h-4" />
                Adjust Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-heading">Wallet Correction Utility</DialogTitle>
              </DialogHeader>
              <WalletAdjustmentModal
                onSuccess={() => {
                  setAdjustmentDialogOpen(false)
                  loadWalletData()
                  alert('Adjustment complete!')
                }}
              />
            </DialogContent>
          </Dialog>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4" />
            Export Audit Log
          </Button>
        </div>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Universities', val: walletSummary.university_total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Consultancies', val: walletSummary.consultancy_total, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Agents', val: walletSummary.agent_total, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Network Total', val: walletSummary.system_total, color: 'text-white', bg: 'bg-primary' },
        ].map((card, i) => (
          <Card key={i} className={`p-6 border-none shadow-sm ${card.bg}`}>
            <p className={`text-sm font-semibold mb-2 ${card.color === 'text-white' ? 'text-white/80' : 'text-muted-foreground'}`}>{card.label}</p>
            <p className={`text-3xl font-black ${card.color}`}>₹{card.val.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      {/* Transaction Ledger */}
      <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold font-heading">Recent Transactions Audit</h3>
          <Button variant="ghost" size="sm" onClick={loadWalletData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh Data"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">Entity</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold">Flow</TableHead>
                <TableHead className="font-bold">Purpose</TableHead>
                <TableHead className="font-bold">Reference</TableHead>
                <TableHead className="font-bold text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && transactions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground italic">
                    No financial records found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn: any) => (
                  <TableRow key={txn.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-tighter">
                        {txn.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{txn.transaction_type.toUpperCase()}</TableCell>
                    <TableCell className={`font-black font-mono ${txn.transaction_type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {txn.transaction_type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {txn.transaction_type === "credit" ? (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full w-fit">
                          <ArrowUpRight className="w-3 h-3" /> INFLOW
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit">
                          <ArrowDownLeft className="w-3 h-3" /> OUTFLOW
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={txn.description}>
                      <span className="font-bold text-black opacity-80 uppercase text-[9px] block">
                        {(txn.purpose || txn.reference_type || 'transaction').replace(/_/g, ' ')}
                      </span>
                      {txn.description}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {txn.reference_id?.slice(0, 8) || 'SYSTEM'}
                    </TableCell>
                    <TableCell className="text-right text-[11px] font-medium text-muted-foreground">
                      {new Date(txn.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
