"use client"

import { useState } from "react"
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
  const [action, setAction] = useState<"approve" | "reject" | "revert" | null>(null)
  const [formData, setFormData] = useState({
    reason: "",
    message: "",
    payment_confirmation: null as File | null,
    approval_document: null as File | null,
  })
  const [loading, setLoading] = useState(false)

  // Mock data - replace with actual API call
  const admissionData = {
    id: admissionId,
    student: {
      name: studentName,
      email: "student@email.com",
      phone: "9876543210",
      dob: "2000-05-15",
      gender: "Male",
      address: "123, MG Road, Delhi - 110001",
    },
    course: {
      name: "B.Tech Computer Science",
      university: "Delhi University",
      duration: "4 Years",
      mode: "Regular",
    },
    documents: [
      { name: "10th Marksheet", status: "verified", url: "#" },
      { name: "12th Marksheet", status: "verified", url: "#" },
      { name: "ID Proof (Aadhar)", status: "verified", url: "#" },
      { name: "Passport Photo", status: "pending", url: "#" },
      { name: "Migration Certificate", status: "verified", url: "#" },
    ],
    financial: {
      university_fee: 400000,
      display_fee: 500000,
      actual_fee: 480000,
      consultancy_profit: 80000,
      agent_commission: 30000,
      net_profit: 50000,
      admission_by: "agent",
      agent_name: "Rajesh Kumar",
      consultancy_name: "Global Education Consultants",
    },
    status: "submitted_to_university",
    submitted_date: "2024-01-15",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!action) return

    setLoading(true)

    try {
      const response = await fetch(`/api/admissions/${admissionId}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...formData,
        }),
      })

      if (response.ok) {
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to review admission:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Admission Review</h3>
          <p className="text-sm text-muted-foreground">{studentName}</p>
        </div>
        <Badge variant={admissionData.status === "submitted_to_university" ? "default" : "secondary"}>
          {admissionData.status.replace(/_/g, " ").toUpperCase()}
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
                <p className="font-medium">{admissionData.student.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{admissionData.student.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{admissionData.student.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{admissionData.student.dob}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="font-medium">{admissionData.student.gender}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{admissionData.student.address}</p>
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
                <p className="font-medium">{admissionData.course.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">University</p>
                <p className="font-medium">{admissionData.course.university}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{admissionData.course.duration}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mode</p>
                <p className="font-medium">{admissionData.course.mode}</p>
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
              {admissionData.documents.map((doc, index) => (
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
                <span className="font-semibold">₹{admissionData.financial.university_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-sm">Student Display Fee</span>
                <span className="font-semibold">₹{admissionData.financial.display_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">Actual Fee Collected</span>
                <span className="font-semibold">₹{admissionData.financial.actual_fee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between p-2">
                <span className="text-sm">Consultancy Profit</span>
                <span className="font-semibold text-green-600">₹{admissionData.financial.consultancy_profit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">Agent Commission</span>
                <span className="font-semibold text-blue-600">₹{admissionData.financial.agent_commission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-sm">Net Profit</span>
                <span className="font-semibold text-purple-600">₹{admissionData.financial.net_profit.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <p><strong>Admission By:</strong> {admissionData.financial.admission_by === "agent" ? "Agent" : "Consultancy"}</p>
                {admissionData.financial.admission_by === "agent" && (
                  <p><strong>Agent Name:</strong> {admissionData.financial.agent_name}</p>
                )}
                <p><strong>Consultancy:</strong> {admissionData.financial.consultancy_name}</p>
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
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Processing..." : `Confirm ${action}`}
              </Button>
            </div>
          </Card>
        )}
      </form>
    </div>
  )
}
