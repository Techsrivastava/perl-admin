"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Download, FileText, DollarSign, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase"

interface FeeApprovalModalProps {
  submissionId: string
  onSuccess?: () => void
}

export function FeeApprovalModal({ submissionId, onSuccess }: FeeApprovalModalProps) {
  const [submission, setSubmission] = useState<any>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (submissionId) loadSubmission()
  }, [submissionId])

  const loadSubmission = async () => {
    try {
      setFetching(true)
      const { data, error } = await supabase
        .from('fee_submissions')
        .select(`
          *,
          admissions (
            id,
            student_name,
            total_fee,
            fee_paid,
            university_id,
            consultancy_id,
            agent_id,
            university_courses (
               university_fee,
               commission_value,
               master_courses ( name )
            ),
            consultancies ( name, commission_type, commission_value ),
            agents ( name, commission_rate )
          )
        `)
        .eq('id', submissionId)
        .single()

      if (error) throw error
      setSubmission(data)
    } catch (err: any) {
      console.error("Error loading submission:", err)
    } finally {
      setFetching(false)
    }
  }

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action || !submission) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (action === 'reject') {
        const { error } = await supabase
          .from('fee_submissions')
          .update({
            status: 'rejected',
            rejection_reason: notes,
            reviewed_by_id: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', submissionId)
        if (error) throw error
      } else {
        // APPROVE LOGIC
        const amount = submission.amount_received
        const admission = submission.admissions

        // 1. Update Admission Fee Paid
        const { error: admError } = await supabase
          .from('admissions')
          .update({
            fee_paid: (admission.fee_paid || 0) + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', admission.id)
        if (admError) throw admError

        // 2. Calculate Financials
        const universityFee = admission.university_courses?.university_fee || 0
        const totalCommissionPool = amount - universityFee

        // Agent Commission
        let agentComm = 0
        if (admission.agent_id && admission.agents?.commission_rate) {
          agentComm = (totalCommissionPool * (admission.agents.commission_rate / 100))
        }

        // 3. Create Ledger Entries (Trigger will update wallets)

        // entry for University (Credit Fee)
        await supabase.from('ledger').insert({
          entity_id: admission.university_id,
          entity_type: 'university',
          transaction_type: 'credit',
          amount: universityFee,
          purpose: 'admission_fee',
          reference_id: admission.id,
          reference_type: 'admission',
          description: `Fee received for student: ${admission.student_name}`
        })

        // entry for Agent (Credit Commission)
        if (admission.agent_id && agentComm > 0) {
          await supabase.from('ledger').insert({
            entity_id: admission.agent_id,
            entity_type: 'agent',
            transaction_type: 'credit',
            amount: agentComm,
            purpose: 'commission',
            reference_id: admission.id,
            reference_type: 'admission',
            description: `Commission for student: ${admission.student_name}`
          })
        }

        // entry for Consultancy (Credit remaining profit)
        const consultProfit = totalCommissionPool - agentComm
        if (admission.consultancy_id && consultProfit > 0) {
          await supabase.from('ledger').insert({
            entity_id: admission.consultancy_id,
            entity_type: 'consultancy',
            transaction_type: 'credit',
            amount: consultProfit,
            purpose: 'commission',
            reference_id: admission.id,
            reference_type: 'admission',
            description: `Profit share for student: ${admission.student_name}`
          })
        }

        // 4. Finalize Submission
        const { error: subError } = await supabase
          .from('fee_submissions')
          .update({
            status: 'approved',
            reviewed_by_id: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', submissionId)
        if (subError) throw subError
      }

      alert(`Submission ${action}ed successfully!`)
      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to process approval:", error)
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Loading submission details...</p>
    </div>
  )

  if (!submission) return <div className="p-10 text-center">Submission not found</div>

  const admission = submission.admissions
  const universityFee = admission.university_courses?.university_fee || 0
  const profitPool = submission.amount_received - universityFee
  const agentRate = admission.agents?.commission_rate || 0
  const agentComm = (profitPool * (agentRate / 100))
  const consultancyNet = profitPool - agentComm

  return (
    <form onSubmit={handleProcess} className="space-y-6 max-h-[85vh] overflow-y-auto px-2 scrollbar-hide pb-6">
      <div className="flex items-center justify-between sticky top-0 bg-background pt-2 z-10 pb-4 border-b">
        <div>
          <h3 className="text-2xl font-bold font-heading flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-primary bg-primary/10 p-1.5 rounded-full" />
            Review Payment
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Check details before approving credit</p>
        </div>
        <Badge variant={submission.status === 'pending' ? 'secondary' : 'outline'} className="text-sm px-3 py-1">
          {submission.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Submission Info */}
          <Card className="p-5 border-muted shadow-sm ring-1 ring-black/5">
            <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Submission Context</h4>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="col-span-2 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Student Name</p>
                <p className="font-bold text-lg">{admission.student_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Course</p>
                <p className="font-semibold">{admission.university_courses?.master_courses?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Admin ID</p>
                <p className="font-mono text-xs">{admission.id.slice(0, 12)}...</p>
              </div>
            </div>
          </Card>

          {/* Payment Details */}
          <Card className="p-5 border-muted shadow-sm overflow-hidden ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Payment Details</h4>
              <Badge variant="outline" className="capitalize">{submission.payment_mode}</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div>
                  <p className="text-xs text-primary/70 font-semibold mb-1">Amount to Credit</p>
                  <p className="text-3xl font-black text-primary">₹{submission.amount_received.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Date Paid</p>
                  <p className="font-bold">{new Date(submission.payment_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm px-1">
                <div>
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-bold break-all">{submission.transaction_id || "N/A"}</p>
                </div>
                {submission.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Submission Note</p>
                    <p className="italic text-muted-foreground">"{submission.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Proofs */}
          <Card className="p-5 border-muted shadow-sm ring-1 ring-black/5">
            <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 flex items-center justify-between">
              Payment Proofs
              <span className="text-xs lowercase">({submission.proof_urls?.length || 0} files)</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {submission.proof_urls && submission.proof_urls.map((url: string, idx: number) => (
                <a key={idx} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Proof Document #{idx + 1}</span>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </a>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Financial Breakdown */}
        <div className="space-y-6">
          <Card className="p-5 border-primary/20 bg-primary/[0.02] shadow-sm ring-1 ring-primary/10">
            <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Settlement Breakdown
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground">University Share</span>
                <span className="font-bold">₹{universityFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground">Commission Pool</span>
                <span className="font-bold text-green-600">₹{profitPool.toLocaleString()}</span>
              </div>
              <Separator className="bg-primary/10" />
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/50">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Agent ({agentRate}%)</span>
                  <span className="font-medium">{admission.agents?.name}</span>
                </div>
                <span className="font-bold text-blue-600">₹{agentComm.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/50">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Consultancy</span>
                  <span className="font-medium">{admission.consultancies?.name}</span>
                </div>
                <span className="font-bold text-purple-600">₹{consultancyNet.toLocaleString()}</span>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg text-xs border border-green-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-800 font-medium">Automatic wallet credits will be applied on approval.</span>
              </div>
            </div>
          </Card>

          {/* Action Form */}
          {!action ? (
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 font-bold border-red-200 text-red-600 hover:bg-red-50" onClick={() => setAction('reject')}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button className="h-12 font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20" onClick={() => setAction('approve')}>
                <CheckCircle className="w-4 h-4 mr-2" /> Approve Credit
              </Button>
            </div>
          ) : (
            <Card className="p-5 border-amber-200 bg-amber-50/20 animate-in slide-in-from-right-4">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                {action === 'approve' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                Confirm {action}
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">{action === 'approve' ? 'Internal Remarks' : 'Rejection Reason *'}</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={action === 'approve' ? "Optional notes for the record..." : "Explain why this payment is incorrect..."}
                    required={action === 'reject'}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1 font-bold" onClick={() => setAction(null)}>Back</Button>
                  <Button
                    className={`flex-1 font-bold ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    onClick={handleProcess}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Final ${action}`}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </form>
  )
}
