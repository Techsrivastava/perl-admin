"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AdmissionForm } from "@/components/admin/admission-form"
import { AdmissionReviewModal } from "@/components/admin/admission-review-modal"

import { createClient } from "@/lib/supabase"

interface Admission {
  id: string
  student_name: string
  student_email: string
  status: string
  total_fee: number
  fee_paid: number

  university_courses: {
    master_courses: {
      name: string
    }
  }
  universities: {
    name: string
  }
  consultancies: {
    name: string
  }
  created_at: string
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadAdmissions()
  }, [])

  const loadAdmissions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admissions')
        .select(`
          id,
          student_name,
          student_email,
          status,
          total_fee,
          fee_paid,

          created_at,
          university_id,
          course_id,
          consultancy_id,
          universities ( name ),
          consultancies ( name ),
          university_courses (
            master_courses ( name )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data for easier consumption in the UI
      const formattedData = (data as any[]).map(item => ({
        ...item,
        course: item.university_courses?.master_courses?.name || 'N/A',
        university: item.universities?.name || 'N/A',
        consultancy: item.consultancies?.name || 'N/A'
      }))

      setAdmissions(formattedData)
    } catch (error: any) {
      console.error('Error loading admissions:', error)
      setError(error.message || 'Failed to load admissions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "reverted":
      case "rejected":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getFeePercentage = (received: number, total: number) => {
    if (!total || total === 0) return 0
    return Math.round((received / total) * 100)
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('admissions')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) {
      alert("Failed to approve: " + error.message)
    } else {
      loadAdmissions()
    }
  }

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('admissions')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      alert("Failed to reject: " + error.message)
    } else {
      loadAdmissions()
    }
  }

  const handleReview = (admission: Admission) => {
    setSelectedAdmission(admission)
    setReviewDialogOpen(true)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admissions Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Admission
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Admission</DialogTitle>
            </DialogHeader>
            <AdmissionForm onSuccess={() => {
              setIsOpen(false)
              loadAdmissions() // Reload admissions
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">Loading admissions...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Consultancy</TableHead>
                  <TableHead>Fee Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No admissions found. Add your first admission to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  admissions.map((admission) => {
                    const feePercentage = getFeePercentage(admission.fee_paid, admission.total_fee)

                    return (
                      <TableRow key={admission.id} className="border-b border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{admission.student_name}</TableCell>
                        <TableCell className="text-sm">{admission.course}</TableCell>
                        <TableCell className="text-sm">{admission.university}</TableCell>
                        <TableCell className="text-sm">{admission.consultancy}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${feePercentage}%` }} />
                            </div>
                            <span className="text-xs font-medium">{feePercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}
                          >
                            {admission.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReview(admission)}
                              title="Review Admission"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {admission.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600"
                                  onClick={() => handleApprove(admission.id)}
                                  title="Quick Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleReject(admission.id)}
                                  title="Quick Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Admission Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={(open) => {
        setReviewDialogOpen(open)
        if (!open) setSelectedAdmission(null)
      }}>
        <DialogContent className="max-w-4xl">
          <AdmissionReviewModal
            admissionId={selectedAdmission?.id.toString() || ""}
            studentName={selectedAdmission?.student_name || ""}
            onSuccess={() => {
              setReviewDialogOpen(false)
              setSelectedAdmission(null)
              loadAdmissions() // Reload admissions
              alert('Admission reviewed successfully!')
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
