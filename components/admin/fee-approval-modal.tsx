"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Download, FileText, DollarSign } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface FeeApprovalModalProps {
  submissionId: string
  onSuccess?: () => void
}

export function FeeApprovalModal({ submissionId, onSuccess }: FeeApprovalModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock data - replace with actual API call
  const submission = {
    id: submissionId,
    admission_id: "ADM001",
    student_name: "Rahul Sharma",
    course_name: "B.Tech Computer Science",
    agent_name: "Rajesh Kumar",
    agent_code: "AGT001",
    amount_received: 480000,
    payment_mode: "UPI",
    payment_date: "2024-01-15",
    transaction_id: "TXN123456789",
    payment_proofs: [
      { name: "receipt.pdf", url: "#" },
      { name: "bank_statement.jpg", url: "#" },
    ],
    agent_notes: "Full payment received via UPI",
    agreed_fee: 480000,
    university_fee: 400000,
    actual_profit: 80000,
    agent_commission_percent: 10,
    agent_commission: 8000,
    agent_expenses: 2000,
    agent_final: 10000,
    consultancy_expenses: 5000,
    consultancy_net: 65000,
    submitted_date: "2024-01-15T10:30:00",
    status: "pending",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action) return

    setLoading(true)

    try {
      const response = await fetch(`/api/fee-submissions/${submissionId}/${action}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to process approval:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Approve Fee Submission
        </h3>
        <p className="text-sm text-muted-foreground">Review and approve agent's fee submission</p>
      </div>

      {/* Submission Details */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Submission Details</h4>
          <Badge variant={submission.status === "pending" ? "default" : "secondary"}>
            {submission.status.toUpperCase()}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Submission ID</p>
            <p className="font-medium">{submission.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Admission ID</p>
            <p className="font-medium">{submission.admission_id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Student Name</p>
            <p className="font-medium">{submission.student_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Course</p>
            <p className="font-medium">{submission.course_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Agent Name</p>
            <p className="font-medium">{submission.agent_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Agent Code</p>
            <p className="font-medium">{submission.agent_code}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted On</p>
            <p className="font-medium">{new Date(submission.submitted_date).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Payment Information */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Payment Information</h4>
        <div className="space-y-3">
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span className="text-sm">Amount Received</span>
            <span className="font-semibold">₹{submission.amount_received.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2">
            <span className="text-sm">Agreed Fee</span>
            <span className="font-semibold">₹{submission.agreed_fee.toLocaleString()}</span>
          </div>
          {submission.amount_received !== submission.agreed_fee && (
            <div className="flex justify-between p-2 bg-amber-50 border border-amber-200 rounded">
              <span className="text-sm font-semibold text-amber-900">Difference</span>
              <span className="font-semibold text-amber-900">
                ₹{Math.abs(submission.amount_received - submission.agreed_fee).toLocaleString()}
              </span>
            </div>
          )}
          <Separator />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Payment Mode</p>
              <p className="font-medium">{submission.payment_mode}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Date</p>
              <p className="font-medium">{submission.payment_date}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-medium">{submission.transaction_id || "N/A"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Proofs */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Payment Proofs
        </h4>
        <div className="space-y-2">
          {submission.payment_proofs.map((proof, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{proof.name}</span>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Financial Breakdown */}
      <Card className="p-4 border-primary/50">
        <h4 className="font-semibold mb-4">Financial Breakdown (Computed)</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between p-2">
            <span>University Fee</span>
            <span className="font-semibold">₹{submission.university_fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 bg-green-50 rounded">
            <span className="font-semibold text-green-900">Actual Profit</span>
            <span className="font-semibold text-green-900">₹{submission.actual_profit.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between p-2">
            <span>Agent Commission ({submission.agent_commission_percent}%)</span>
            <span className="font-semibold text-blue-600">₹{submission.agent_commission.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2">
            <span>Agent Expenses</span>
            <span className="font-semibold">₹{submission.agent_expenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 bg-blue-50 rounded">
            <span className="font-semibold text-blue-900">Agent Final Amount</span>
            <span className="font-semibold text-blue-900">₹{submission.agent_final.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between p-2">
            <span>Consultancy Expenses</span>
            <span className="font-semibold">₹{submission.consultancy_expenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-2 bg-purple-50 rounded">
            <span className="font-semibold text-purple-900">Consultancy Net Profit</span>
            <span className="font-semibold text-purple-900">₹{submission.consultancy_net.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Agent Notes */}
      {submission.agent_notes && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Agent's Notes</h4>
          <p className="text-sm text-muted-foreground">{submission.agent_notes}</p>
        </Card>
      )}

      <Separator />

      {/* Action Section */}
      {!action ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="destructive"
            className="flex items-center justify-center gap-2"
            onClick={() => setAction("reject")}
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button
            type="button"
            className="flex items-center justify-center gap-2"
            onClick={() => setAction("approve")}
          >
            <CheckCircle className="w-4 h-4" />
            Approve & Generate Receipt
          </Button>
        </div>
      ) : (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 capitalize">{action} Fee Submission</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="notes">
                {action === "approve" ? "Approval Notes (Optional)" : "Rejection Reason *"}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={action === "approve" ? "Any additional notes" : "Provide reason for rejection"}
                rows={3}
                required={action === "reject"}
              />
            </div>

            {action === "approve" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                <p className="font-semibold text-green-900 mb-1">Upon Approval:</p>
                <ul className="text-green-700 space-y-1 list-disc list-inside">
                  <li>Fee receipt will be generated</li>
                  <li>Ledger entries will be created</li>
                  <li>Wallet balances will be updated</li>
                  <li>Agent will be notified</li>
                  <li>University will be notified (if applicable)</li>
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Processing..." : `Confirm ${action}`}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </form>
  )
}
