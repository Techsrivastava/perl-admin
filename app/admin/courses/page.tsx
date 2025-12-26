"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CourseManagementModal } from "@/components/admin/course-management-modal"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"

interface Course {
  id: string
  name: string
  abbreviation?: string
  code?: string
  status?: string
  department?: string
  stream?: string // Added missing stream property
  degreeType?: string
  duration?: string
  modeOfStudy?: string
  level?: string
  fees?: number
  totalSeats?: number
  availableSeats?: number
  description?: string
  eligibility?: string[]
  isActive?: boolean
  scholarshipAvailable?: boolean
  placementSupport?: boolean
  specialization?: string
  accreditation?: string
  approvedBy?: string
  semesterCount?: number
  mediumOfInstruction?: string
  entranceExam?: string
  cutoffPercentage?: number
  careerOptions?: string[]
  affiliatedUniversity?: string
  internshipIncluded?: boolean
  industryTieups?: boolean
  labFacilities?: string
  researchOpportunities?: string
  recognizedBy?: string
  universityType?: string
  courseType?: string
  yearOfEstablishment?: number
  state?: string
  city?: string
  averagePackage?: number
  highestPackage?: number
  placementPercentage?: number
  topRecruiters?: string[]
  hostelFacility?: string
  hostelFees?: number
  transportFacility?: string
  libraryFacility?: string
  sportsFacilities?: string
  medicalFacilities?: string
  extracurricularActivities?: string[]
  nbaAccreditationValidity?: string
  naacGrade?: string
  nirfRanking?: number
  autonomousStatus?: string
  courseHighlights?: string[]
  admissionProcess?: string
  documentsRequired?: string[]
  reservationPolicy?: string
  feeStructure?: string
  scholarships?: string[]
  loanFacility?: string
  alumniNetwork?: string
  facultyCount?: number
  facultyQualification?: string
  studentFacultyRatio?: number
  infrastructureRating?: string
  collaborations?: string[]
  exchangePrograms?: string
  industryVisits?: boolean
  guestLectures?: boolean
  workshops?: boolean
  seminars?: boolean
  projectWork?: string
  examPattern?: string
  gradingSystem?: string
  attendanceRequirement?: string
  courseOutcomes?: string[]
  jobProspects?: string
  higherStudyOptions?: string
  certifications?: string[]
  created_at?: string
}

interface UniversityCourse {
  id: string
  course_name: string
  university_name: string
  university_fee: number
  student_display_fee: number
  consultancy_share: number
  commission_type: string
  intake_capacity: number
  mode_of_study: string
  is_active: boolean
}

export default function CoursesPage() {
  const { toast } = useToast()
  const [token, setToken] = useState<string>('')
  const [courses, setCourses] = useState<Course[]>([])
  const [universityCourses, setUniversityCourses] = useState<UniversityCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<"master" | "university">("university")
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [mapCourseDialogOpen, setMapCourseDialogOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<any | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteMappingConfirmId, setDeleteMappingConfirmId] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadCourses()
    loadUniversityCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('master_courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCourses(data || [])
      setError(null)
    } catch (error) {
      console.error('Error loading courses:', error)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const loadUniversityCourses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('university_courses')
        .select('*, universities(name), master_courses(name)')
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformed = (data || []).map((uc: any) => ({
        id: uc.id,
        course_name: uc.master_courses?.name || 'Unknown',
        university_name: uc.universities?.name || 'Unknown',
        university_fee: uc.university_fee || 0,
        student_display_fee: uc.display_fee || 0,
        consultancy_share: uc.commission_value || 0,
        commission_type: uc.commission_type || 'percentage',
        intake_capacity: uc.intake_capacity || 0,
        mode_of_study: uc.mode_of_study || 'regular',
        is_active: uc.is_active
      }))

      setUniversityCourses(transformed)
    } catch (error) {
      console.error('Error loading university courses:', error)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('master_courses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCourses(courses.filter((c) => c.id !== id))
      setDeleteConfirmId(null)
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting course:', error)
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMapping = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mapping?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('university_courses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setUniversityCourses(universityCourses.filter(uc => uc.id !== id))
      setDeleteMappingConfirmId(null)
      toast({
        title: "Success",
        description: "University course mapping deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting mapping:', error)
      toast({
        title: "Error",
        description: "Failed to delete mapping",
        variant: "destructive",
      })
    }
  }

  const handleEditCourse = (course: any) => {
    // Map master course fields to the format expected by the modal
    setEditingMapping({
      master_course_id: course.id,
      name: course.name,
      code: course.code,
      stream: course.stream,
      level: course.level,
      duration: course.duration,
      semesters: course.semesters,
      metadata: { description: course.description },
      is_active: course.is_active
    })
    setCourseModalOpen(true)
  }

  const handleEditMapping = async (mapping: any) => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('university_courses')
        .select('*, master_courses(*)')
        .eq('id', mapping.id)
        .single()

      if (error) throw error
      setEditingMapping(data)
      setCourseModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Course Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Courses</p>
          <p className="text-3xl font-bold">{courses.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Active Courses</p>
          <p className="text-3xl font-bold text-green-600">{courses.filter(c => c.isActive).length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">UG Courses</p>
          <p className="text-3xl font-bold text-blue-600">{courses.filter(c => c.level === 'UG').length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">PG Courses</p>
          <p className="text-3xl font-bold text-purple-600">{courses.filter(c => c.level === 'PG').length}</p>
        </Card>
      </div>
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("master")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "master"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Master Courses
        </button>
        <button
          onClick={() => setActiveTab("university")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "university"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          University Course Mapping
        </button>
      </div>

      {/* Master Courses Tab */}
      {activeTab === "master" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Dialog
              open={courseModalOpen}
              onOpenChange={(v: boolean) => {
                setCourseModalOpen(v)
                if (!v) setEditingMapping(null)
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary font-black shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> Add Academic Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden border-none">
                <div className="p-6 bg-slate-900 text-white">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Plus className="w-8 h-8 text-primary" />
                    {editingMapping ? "Refine Course Offering" : "Launch New Program"}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Manual Deployment Console</p>
                </div>
                <div className="p-6">
                  <CourseManagementModal
                    editData={editingMapping}
                    onSuccess={() => {
                      setCourseModalOpen(false)
                      setEditingMapping(null)
                      loadCourses()
                      loadUniversityCourses()
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Master Courses Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">All Master Courses</h3>
            {loading && <p className="text-center py-4">Loading courses...</p>}
            {error && <p className="text-center py-4 text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border">
                      <TableHead>Course Name</TableHead>
                      <TableHead>Stream</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Fee (₹)</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No courses found. Add your first course to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      courses.map((course) => (
                        <TableRow key={course.id} className="border-b border-border hover:bg-muted/50">
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.stream}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{course.level}</span>
                          </TableCell>
                          <TableCell>{course.duration || 'N/A'}</TableCell>
                          <TableCell>{course.modeOfStudy || 'N/A'}</TableCell>
                          <TableCell className="font-semibold">
                            {course.fees ? `₹${(course.fees / 100000).toFixed(1)}L` : 'N/A'}
                          </TableCell>
                          <TableCell>{course.totalSeats || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm ${course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {course.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCourse(course)}
                                title="Edit Course"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              {deleteConfirmId === course.id ? (
                                <div className="flex gap-1">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteCourse(course.id)}
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteConfirmId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setDeleteConfirmId(course.id)}
                                  title="Delete Course"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
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
        </div>
      )}

      {/* University Course Mapping Tab */}
      {activeTab === "university" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setCourseModalOpen(true)}>
              <Plus className="w-4 h-4" /> Map New Course
            </Button>
          </div>

          {/* University Courses Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">University Course Mapping</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead>Course Name</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead>Study Fee</TableHead>
                    <TableHead>Partner Payout</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {universityCourses.map((uc) => (
                    <TableRow key={uc.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-blue-600">{uc.course_name}</TableCell>
                      <TableCell className="font-bold">{uc.university_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-green-700">₹{uc.student_display_fee.toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Net: ₹{uc.university_fee.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">
                            {uc.commission_type === 'percentage' ? `${uc.consultancy_share}%` : `₹${uc.consultancy_share.toLocaleString()}`}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">{uc.commission_type} Payout</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{uc.intake_capacity}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-[10px] font-bold uppercase tracking-widest">
                          {uc.mode_of_study}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={uc.is_active ? "default" : "secondary"} className={uc.is_active ? "bg-green-500" : ""}>
                          {uc.is_active ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMapping(uc)}
                            title="Edit Mapping"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {deleteMappingConfirmId === uc.id ? (
                            <div className="flex gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteMapping(uc.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteMappingConfirmId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteMappingConfirmId(uc.id)}
                              title="Delete Mapping"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Fee Calculation Rules */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fee Calculation Rules</h3>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="font-semibold text-blue-900 mb-2">Share Deduct Mode</p>
                <p className="text-blue-800">
                  Student Fee → University Fee is deducted → Consultancy Share is deducted → Agent Commission is
                  deducted → Net profit calculated
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="font-semibold text-green-900 mb-2">Full Fee Mode</p>
                <p className="text-green-800">
                  University receives full agreed amount → Consultancy/Agent paid from system wallet → Student pays
                  agreed amount
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                <p className="font-semibold text-amber-900 mb-2">Auto Calculation</p>
                <p className="text-amber-800">
                  System automatically calculates all fees, profits, commissions and updates wallet balances when
                  admission is approved
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
