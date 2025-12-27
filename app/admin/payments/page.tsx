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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"

interface PaymentRecord {
  id: string
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
  const [activeTab, setActiveTab] = useState<"payments" | "pending">("payments")
  const [feeSubmissionDialogOpen, setFeeSubmissionDialogOpen] = useState(false)
  const [feeApprovalDialogOpen, setFeeApprovalDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [pendingSubmissions, setPendingSubmissions] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [newPayment, setNewPayment] = useState({
    admission_id: "",
    amount: "",
    method: "Bank Transfer",
    notes: "",
  })
  const [admissionsList, setAdmissionsList] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadData()
    loadAdmissionsList()
  }, [])

  const loadAdmissionsList = async () => {
    const { data } = await supabase.from('admissions').select('id, student_name')
    if (data) setAdmissionsList(data)
  }

  const loadData = async () => {
    try {
      setLoading(true)

      // 1. Load Confirmed Payments from Ledger (fetch without join first)
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('ledger')
        .select(`
          id,
          amount,
          description,
          created_at,
          reference_id
        `)
        .eq('reference_type', 'admission')

      if (ledgerError) throw ledgerError

      // Fetch related admissions for the ledger entries
      const admissionIds = [...new Set((ledgerData || []).map(item => item.reference_id).filter(Boolean))] as string[]
      let admissionsMap: Record<string, any> = {}

      if (admissionIds.length > 0) {
        const { data: admData } = await supabase
          .from('admissions')
          .select('id, student_name, payment_mode')
          .in('id', admissionIds)

        if (admData) {
          admissionsMap = admData.reduce((acc, curr) => {
            acc[curr.id] = curr
            return acc
          }, {} as Record<string, any>)
        }
      }

      // 2. Load Pending Submissions (this join works as there is a FK)
      const { data: submissionData, error: subError } = await supabase
        .from('fee_submissions')
        .select(`
          id,
          amount_received,
          payment_mode,
          payment_date,
          transaction_id,
          notes,
          status,
          admissions ( 
            id,
            student_name
          )
        `)
        .eq('status', 'pending')

      if (subError) throw subError

      // Transform ledger to PaymentRecord
      const confirmed: PaymentRecord[] = (ledgerData || []).map((item: any) => {
        const admission = item.reference_id ? admissionsMap[item.reference_id] : null
        return {
          id: item.id,
          admission_id: item.reference_id || 'N/A',
          student_name: admission?.student_name || 'N/A',
          amount: item.amount,
          method: admission?.payment_mode || 'Manual Entry',
          status: 'completed',
          date: item.created_at,
          reference: item.id.slice(0, 8),
          notes: item.description
        }
      })

      // Transform submissions to PaymentRecord
      const pending: PaymentRecord[] = (submissionData || []).map((item: any) => ({
        id: item.id,
        admission_id: item.admissions?.id || 'N/A',
        student_name: item.admissions?.student_name || 'N/A',
        amount: item.amount_received,
        method: item.payment_mode || 'N/A',
        status: 'pending',
        date: item.payment_date,
        reference: item.transaction_id || item.id.slice(0, 8),
        notes: item.notes
      }))

      setPayments(confirmed)
      setPendingSubmissions(pending)
    } catch (error: any) {
      console.error('Error loading payments:', JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (payment: any) => {
    setSelectedPayment(payment)
    setFeeApprovalDialogOpen(true)
  }

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return
    const { error } = await supabase.from('ledger').delete().eq('id', id)
    if (error) alert(error.message)
    else loadData()
  }

  const handleManualPayment = async () => {
    if (!newPayment.admission_id || !newPayment.amount) return
    setLoading(true)

    try {
      const amount = parseFloat(newPayment.amount)

      // 1. Get current admission data
      const { data: admission } = await supabase
        .from('admissions')
        .select('fee_paid, total_fee')
        .eq('id', newPayment.admission_id)
        .single()

      if (!admission) throw new Error("Admission not found")

      // 2. Update admission fee_paid
      const { error: updateError } = await supabase
        .from('admissions')
        .update({
          fee_paid: (admission.fee_paid || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', newPayment.admission_id)

      if (updateError) throw updateError

      // 3. Create Ledger Entry
      const { error: ledgerError } = await supabase
        .from('ledger')
        .insert({
          entity_id: newPayment.admission_id,
          entity_type: 'student',
          transaction_type: 'credit',
          amount: amount,
          purpose: 'admission_fee',
          reference_id: newPayment.admission_id,
          reference_type: 'admission',
          description: `Manual payment recorded: ${newPayment.notes}`
        })

      if (ledgerError) throw ledgerError

      alert('Payment recorded successfully!')
      loadData()
      setNewPayment({ admission_id: "", amount: "", method: "Bank Transfer", notes: "" })
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = pendingSubmissions.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading">Fee & Payments Management</h1>
        <div className="flex gap-2">
          <Dialog open={feeSubmissionDialogOpen} onOpenChange={setFeeSubmissionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Submit Fee Receipt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <FeeSubmissionModal
                userType="agent"
                onSuccess={() => {
                  setFeeSubmissionDialogOpen(false)
                  loadData()
                  alert('Fee submission recorded!')
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Record Manual Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Admission *</Label>
                  <Select value={newPayment.admission_id} onValueChange={(val) => setNewPayment({ ...newPayment, admission_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student admission" />
                    </SelectTrigger>
                    <SelectContent>
                      {admissionsList.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.student_name} ({a.id.slice(0, 8)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Method</Label>
                    <Select value={newPayment.method} onValueChange={(val) => setNewPayment({ ...newPayment, method: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    placeholder="Payment reference, bank name, etc."
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  />
                </div>
                <Button onClick={handleManualPayment} className="w-full" disabled={loading}>
                  {loading ? "Recording..." : "Confirm & Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-green-50/50 border-green-100 shadow-sm">
          <p className="text-sm font-medium text-green-600 mb-1">Total Collected</p>
          <p className="text-4xl font-bold text-green-700">₹{totalCollected.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-amber-50/50 border-amber-100 shadow-sm">
          <p className="text-sm font-medium text-amber-600 mb-1">Pending Approvals</p>
          <p className="text-4xl font-bold text-amber-700">₹{pendingAmount.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-blue-50/50 border-blue-100 shadow-sm">
          <p className="text-sm font-medium text-blue-600 mb-1">Total Transactions</p>
          <p className="text-4xl font-bold text-blue-700">{payments.length + pendingSubmissions.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 max-w-md">
          <TabsTrigger value="payments" className="rounded-md">Confirmed ({payments.length})</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-md">Pending ({pendingSubmissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card className="border-none shadow-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Reference</TableHead>
                  <TableHead className="font-bold">Student</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="text-right font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No records found</TableCell></TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.reference}</TableCell>
                      <TableCell className="font-medium">{p.student_name}</TableCell>
                      <TableCell className="font-bold text-green-600 font-mono">₹{p.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                          {p.method}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(p.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(p.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="border-none shadow-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Student</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Mode</TableHead>
                  <TableHead className="font-bold">Submitted On</TableHead>
                  <TableHead className="text-right font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubmissions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No pending submissions</TableCell></TableRow>
                ) : (
                  pendingSubmissions.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium">{p.student_name}</TableCell>
                      <TableCell className="font-bold text-amber-600 font-mono">₹{p.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize text-sm">{p.method.replace('_', ' ')}</TableCell>
                      <TableCell className="text-sm">{new Date(p.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleApprove(p)} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                          Review & Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={feeApprovalDialogOpen} onOpenChange={setFeeApprovalDialogOpen}>
        <DialogContent className="max-w-4xl">
          <FeeApprovalModal
            submissionId={selectedPayment?.id || ""}
            onSuccess={() => {
              setFeeApprovalDialogOpen(false)
              setSelectedPayment(null)
              loadData()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
