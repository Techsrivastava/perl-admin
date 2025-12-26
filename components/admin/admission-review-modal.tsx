"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  GraduationCap,
  DollarSign
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdmissionReviewModalProps {
  admissionId: string
  studentName: string
  onSuccess?: () => void
}

export function AdmissionReviewModal({ admissionId, studentName, onSuccess }: AdmissionReviewModalProps) {
  const [admissionData, setAdmissionData] = useState<any>(null)
  const [action, setAction] = useState<"approve" | "reject" | "revert" | null>(null)
  const [formData, setFormData] = useState({
    reason: "",
    message: "",
    payment_confirmation: null as File | null,
    approval_document: null as File | null,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadAdmissionDetails()
  }, [admissionId])

  const loadAdmissionDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admissions')
        .select(`
          *,
          universities ( name, contact_email, contact_phone ),
          consultancies ( name, contact_email, contact_phone ),
          agents ( first_name, last_name, commission_rate ),
          university_courses (
            university_fee,
            display_fee,
            commission_type,
            commission_value,
            master_courses ( name, duration )
          )
        `)
        .eq('id', admissionId)
        .single()

      if (error) throw error
      setAdmissionData(data)
    } catch (error: any) {
      console.error("Error loading admission details:", error)
      alert("Failed to load details: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action) return

    setSubmitting(true)

    try {
      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        revert: 'reverted'
      }

      const { error } = await supabase
        .from('admissions')
        .update({
          status: statusMap[action],
          rejection_reason: action === 'reject' ? formData.reason : null,
          metadata: {
            ...admissionData.metadata,
            review_message: formData.message,
            reviewed_at: new Date().toISOString()
          }
        })
        .eq('id', admissionId)

      if (error) throw error

      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to review admission:", error)
      alert("Error: " + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading details...</div>
  if (!admissionData) return <div className="p-8 text-center text-red-500">Admission not found</div>

  const financial = {
    university_fee: admissionData.university_courses?.university_fee || 0,
    display_fee: admissionData.university_courses?.display_fee || 0,
    actual_fee: admissionData.total_fee || 0,
    consultancy_profit: (admissionData.university_courses?.commission_type === 'percent'
      ? (admissionData.total_fee * (admissionData.university_courses?.commission_value / 100))
      : admissionData.university_courses?.commission_value) || 0,
    agent_commission: (admissionData.agents?.commission_rate
      ? (admissionData.total_fee * (admissionData.agents.commission_rate / 100))
      : 0),
    net_profit: 0 // Will calculate properly if needed
  }
  financial.net_profit = financial.actual_fee - financial.university_fee - financial.agent_commission

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Admission Review</h3>
          <p className="text-sm text-muted-foreground">{studentName}</p>
        </div>
        <Badge variant={admissionData.status === "approved" ? "default" : "secondary"}>
          {admissionData.status.toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="student" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="student">Student Info</TabsTrigger>
          <TabsTrigger value="course">Course Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Student Info Tab */}
        <TabsContent value="student" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Personal Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Full Name</p>
                <p className="font-medium">{admissionData.student_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{admissionData.student_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{admissionData.student_phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{admissionData.metadata?.dob || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="font-medium">{admissionData.metadata?.gender || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{admissionData.metadata?.address || 'N/A'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Course Details Tab */}
        <TabsContent value="course" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Course Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Course Name</p>
                <p className="font-medium">{admissionData.university_courses?.master_courses?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">University</p>
                <p className="font-medium">{admissionData.universities?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{admissionData.university_courses?.master_courses?.duration}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mode</p>
                <p className="font-medium">{admissionData.university_courses?.mode_of_study || 'N/A'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Submitted Documents</h4>
            </div>
            <div className="space-y-2">
              {(admissionData.metadata?.documents || []).map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.status === "verified" ? "default" : "secondary"}>
                      {doc.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(admissionData.metadata?.documents || []).length === 0 && (
                <p className="text-center py-4 text-sm text-muted-foreground">No documents uploaded</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Financial Breakdown</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">University Fee</span>
                <span className="font-semibold">₹{financial.university_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-sm">Student Display Fee</span>
                <span className="font-semibold">₹{financial.display_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">Actual Fee Collected</span>
                <span className="font-semibold">₹{financial.actual_fee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between p-2">
                <span className="text-sm">Consultancy Profit</span>
                <span className="font-semibold text-green-600">₹{financial.consultancy_profit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">Agent Commission</span>
                <span className="font-semibold text-blue-600">₹{financial.agent_commission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-sm">Net Profit</span>
                <span className="font-semibold text-purple-600">₹{financial.net_profit.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <p><strong>Admission By:</strong> {admissionData.agent_id ? "Agent" : "Consultancy"}</p>
                {admissionData.agent_id && (
                  <p><strong>Agent Name:</strong> {admissionData.agents ? `${admissionData.agents.first_name} ${admissionData.agents.last_name}` : "N/A"}</p>
                )}
                <p><strong>Consultancy:</strong> {admissionData.consultancies?.name || "N/A"}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Action Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!action ? (
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setAction("revert")}
            >
              <AlertCircle className="w-4 h-4" />
              Revert
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => setAction("reject")}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button
              type="button"
              className="flex items-center gap-2"
              onClick={() => setAction("approve")}
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
          </div>
        ) : (
          <Card className="p-4">
            <h4 className="font-semibold mb-3 capitalize">{action} Admission</h4>

            {action === "revert" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="message">Message for Consultancy *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Explain what needs to be corrected"
                    rows={3}
                    required
                  />
                </div>
              </div>
            )}

            {action === "reject" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reason">Rejection Reason *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Provide detailed reason for rejection"
                    rows={3}
                    required
                  />
                </div>
              </div>
            )}

            {action === "approve" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="approval_doc">Upload Approval Document (Optional)</Label>
                  <Input
                    id="approval_doc"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFormData({ ...formData, approval_document: e.target.files?.[0] || null })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_conf">Upload Payment Confirmation (Optional)</Label>
                  <Input
                    id="payment_conf"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFormData({ ...formData, payment_confirmation: e.target.files?.[0] || null })}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Additional Notes</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Any additional notes for consultancy"
                    rows={2}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Processing..." : `Confirm ${action}`}
              </Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  )
}
