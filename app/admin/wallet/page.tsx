"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, TrendingUp, TrendingDown, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { WalletAdjustmentModal } from "@/components/admin/wallet-adjustment-modal"

export default function WalletPage() {
  const { data: session } = useSession()
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)
  const [walletSummary, setWalletSummary] = useState({
    university_total: 0,
    consultancy_total: 0,
    agent_total: 0,
    super_admin_total: 0,
  })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load wallet data on component mount
  useEffect(() => {
    if (session?.accessToken) {
      loadWalletData()
    }
  }, [session])

  const loadWalletData = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await fetch(`${backendUrl}/api/wallet`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Assuming backend returns data directly or wrapped in success response
        const walletData = data.success ? data.data : data
        setWalletSummary(walletData.summary || walletSummary)
        setTransactions(walletData.transactions || [])
      } else {
        setError('Failed to load wallet data')
      }
    } catch (error) {
      console.error('Error loading wallet data:', error)
      setError('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet & Ledger Management</h1>
        <div className="flex gap-2">
          <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Adjust Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Wallet Adjustment</DialogTitle>
              </DialogHeader>
              <WalletAdjustmentModal 
                onSuccess={() => {
                  setAdjustmentDialogOpen(false)
                  loadWalletData() // Reload wallet data
                  alert('Wallet adjusted successfully!')
                }} 
              />
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Universities Total</p>
          <p className="text-2xl font-bold">₹{(walletSummary.university_total / 100000).toFixed(1)}L</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Consultancies Total</p>
          <p className="text-2xl font-bold">₹{(walletSummary.consultancy_total / 100000).toFixed(1)}L</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Agents Total</p>
          <p className="text-2xl font-bold">₹{(walletSummary.agent_total / 100000).toFixed(1)}L</p>
        </Card>
        <Card className="p-6 bg-primary text-primary-foreground">
          <p className="text-sm opacity-90 mb-2">System Total</p>
          <p className="text-2xl font-bold">₹{(walletSummary.super_admin_total / 100000).toFixed(1)}L</p>
        </Card>
      </div>

      {/* Transaction Ledger */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        {loading ? (
          <div className="text-center py-8">Loading transactions...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn: any) => (
                    <TableRow key={txn.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{txn.type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{txn.description}</TableCell>
                      <TableCell className="font-semibold">₹{(txn.amount / 1000).toFixed(0)}K</TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 ${
                            txn.direction === "in" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {txn.direction === "in" ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {txn.direction === "in" ? "Income" : "Expense"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{txn.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
