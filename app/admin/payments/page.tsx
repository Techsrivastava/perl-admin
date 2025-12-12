"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Filter, Plus, Eye, Trash2, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FeeSubmissionModal } from "@/components/admin/fee-submission-modal"
import { FeeApprovalModal } from "@/components/admin/fee-approval-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Payment {
  id: number
  admission_id: string
  student_name: string
  amount: number
  method: string
  status: string
  date: string
  reference: string
  notes: string
}

export default function PaymentsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"payments" | "pending">("payments")
  const [feeSubmissionDialogOpen, setFeeSubmissionDialogOpen] = useState(false)
  const [feeApprovalDialogOpen, setFeeApprovalDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load payments data on component mount
  useEffect(() => {
    if (session?.accessToken) {
      loadPayments()
    }
  }, [session])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://perl-backend-env.up.railway.app/'
      const response = await fetch(`${backendUrl}/api/payments`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Assuming backend returns data directly or wrapped in success response
        const paymentsData = data.success ? data.data : data
        setPayments(paymentsData)
      } else {
        setError('Failed to load payments')
      }
    } catch (error) {
      console.error('Error loading payments:', error)
      setError('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const [newPayment, setNewPayment] = useState({
    admission_id: "",
    student_name: "",
    amount: "",
    method: "Bank Transfer",
    notes: "",
  })

  const handleAddPayment = () => {
    if (newPayment.admission_id && newPayment.student_name && newPayment.amount) {
      const payment: Payment = {
        id: Math.max(...payments.map((p) => p.id), 0) + 1,
        admission_id: newPayment.admission_id,
        student_name: newPayment.student_name,
        amount: Number.parseInt(newPayment.amount),
        method: newPayment.method,
        status: "completed",
        date: new Date().toISOString().split("T")[0],
        reference: `REF-${Date.now()}`,
        notes: newPayment.notes,
      }
      setPayments([...payments, payment])
      setNewPayment({ admission_id: "", student_name: "", amount: "", method: "Bank Transfer", notes: "" })
    }
  }

  const handleDeletePayment = (id: number) => {
    setPayments(payments.filter((p) => p.id !== id))
  }

  const totalCollected = payments.reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0)
  const pendingAmount = payments.reduce((sum, p) => sum + (p.status === "pending" ? p.amount : 0), 0)

  const handleApprove = (payment: Payment) => {
    setSelectedPayment(payment)
    setFeeApprovalDialogOpen(true)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fee & Payments Management</h1>
        <div className="flex gap-2">
          <Dialog open={feeSubmissionDialogOpen} onOpenChange={setFeeSubmissionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Submit Fee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <FeeSubmissionModal 
                userType="agent"
                onSuccess={() => {
                  setFeeSubmissionDialogOpen(false)
                  loadPayments() // Reload payments
                  alert('Fee submitted successfully!')
                }} 
              />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admission_id">Admission ID *</Label>
                  <Input
                    id="admission_id"
                    placeholder="ADM-001"
                    value={newPayment.admission_id}
                    onChange={(e) => setNewPayment({ ...newPayment, admission_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="student_name">Student Name *</Label>
                  <Input
                    id="student_name"
                    placeholder="Full name"
                    value={newPayment.student_name}
                    onChange={(e) => setNewPayment({ ...newPayment, student_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="500000"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddPayment} className="w-full">
                  Record Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Collected</p>
          <p className="text-3xl font-bold">₹{(totalCollected / 100000).toFixed(2)}L</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending Amount</p>
          <p className="text-3xl font-bold text-orange-600">₹{(pendingAmount / 100000).toFixed(2)}L</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Transactions</p>
          <p className="text-3xl font-bold">{payments.length}</p>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">Loading payments...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payments found. Add your first payment to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{payment.admission_id}</TableCell>
                      <TableCell>{payment.student_name}</TableCell>
                      <TableCell className="font-semibold">₹{(payment.amount / 100000).toFixed(2)}L</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-sm">{payment.reference}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payment.status === "pending" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600"
                              onClick={() => handleApprove(payment)}
                              title="Approve payment"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" title="View details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Fee Approval Dialog */}
      <Dialog open={feeApprovalDialogOpen} onOpenChange={(open) => {
        setFeeApprovalDialogOpen(open)
        if (!open) setSelectedPayment(null)
      }}>
        <DialogContent className="max-w-4xl">
          <FeeApprovalModal 
            submissionId={selectedPayment?.id.toString() || ""}
            onSuccess={() => {
              setFeeApprovalDialogOpen(false)
              setSelectedPayment(null)
              loadPayments() // Reload payments
              alert('Fee approved successfully!')
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
