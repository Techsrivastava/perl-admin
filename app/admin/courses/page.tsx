"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CourseAutopilotForm } from "@/components/admin/course-autopilot-form"
import { MapCourseUniversityModal } from "@/components/admin/map-course-university-modal"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: number
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
  id: number
  course_name: string
  university_name: string
  university_fee: number
  student_display_fee: number
  consultancy_share: number
  agent_commission: number
  fee_mode: string
}

export default function CoursesPage() {
  const { toast } = useToast()
  const [token, setToken] = useState<string>('')
  const [courses, setCourses] = useState<Course[]>([])
  const [universityCourses, setUniversityCourses] = useState<UniversityCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<"master" | "university">("master")
  const [autopilotDialogOpen, setAutopilotDialogOpen] = useState(false)
  const [mapCourseDialogOpen, setMapCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingMapping, setEditingMapping] = useState<UniversityCourse | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleteMappingConfirmId, setDeleteMappingConfirmId] = useState<number | null>(null)

  // Load data on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      loadCourses(storedToken)
      loadUniversityCourses()
    } else {
      setLoading(false)
      setError('No authentication token found')
    }
  }, [])

  const loadCourses = async (authToken: string) => {
    try {
      console.log("Loading courses...")
      setLoading(true)
      const backendUrl = 'https://perl-backend-env.up.railway.app'
      const response = await fetch(`${backendUrl}/api/courses`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Assuming backend returns data directly or wrapped in success response
        const coursesData = data.success ? data.data : data
        const uniqueCourses = (Array.isArray(coursesData) ? coursesData : []).filter((c, index, arr) => arr.findIndex(c2 => c2.id === c.id) === index)
        setCourses(uniqueCourses)
        setError(null)
      } else {
        const errorText = await response.text()
        console.error("Courses API error:", errorText)
        setError('Failed to load courses')
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const loadUniversityCourses = async () => {
    try {
      const backendUrl = 'https://perl-backend-env.up.railway.app'
      
      // Fetch universities for name mapping
      const uniResponse = await fetch(`${backendUrl}/api/universities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      let uniMap = {}
      if (uniResponse.ok) {
        const uniData = await uniResponse.json()
        const unis = uniData.data?.universities || uniData.universities || uniData || []
        uniMap = (Array.isArray(unis) ? unis : []).reduce((acc, uni) => ({ ...acc, [uni.id]: uni.name }), {})
      }

      // Fetch courses and transform to mappings
      const courseResponse = await fetch(`${backendUrl}/api/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        const coursesData = courseData.success ? courseData.data : courseData
        const transformed = (Array.isArray(coursesData) ? coursesData : []).flatMap(course => 
          course.universityIds?.map((uniId, index) => ({
            id: course.id * 100 + index,
            course_name: course.name,
            university_name: uniMap[uniId] || `University ${uniId}`,
            university_fee: course.fees || 0,
            student_display_fee: course.fees ? course.fees * 1.2 : 0,
            consultancy_share: course.fees ? course.fees * 0.1 : 0,
            agent_commission: course.fees ? course.fees * 0.05 : 0,
            fee_mode: 'share_deduct'
          })) || []
        )
        setUniversityCourses(transformed)
      }
    } catch (error) {
      console.error('Error loading university courses:', error)
    }
  }

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      const backendUrl = 'https://perl-backend-env.up.railway.app'
      const response = await fetch(`${backendUrl}/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setCourses(courses.filter((c) => c.id !== id))
        setDeleteConfirmId(null)
        toast({
          title: "Success",
          description: "Course deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMapping = (id: number) => {
    // In real app, call API to delete
    setDeleteMappingConfirmId(null)
    toast({
      title: "Success",
      description: "University course mapping deleted successfully",
    })
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setAutopilotDialogOpen(true)
  }

  const handleEditMapping = (mapping: UniversityCourse) => {
    setEditingMapping(mapping)
    setMapCourseDialogOpen(true)
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
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "master"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Master Courses
        </button>
        <button
          onClick={() => setActiveTab("university")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "university"
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
              open={autopilotDialogOpen} 
              onOpenChange={(open) => {
                setAutopilotDialogOpen(open)
                if (!open) setEditingCourse(null)
              }}
            >
              <DialogTrigger asChild>
                <Button 
                  className="gap-2"
                  onClick={() => setEditingCourse(null)}
                >
                  <Plus className="w-4 h-4" />
                  Add Master Course (Full-Fledge Autopilot)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCourse ? "Edit" : "Add"} Course (Autopilot)</DialogTitle>
                </DialogHeader>
                <CourseAutopilotForm 
                  editMode={!!editingCourse}
                  courseData={editingCourse}
                  onSuccess={() => {
                    setAutopilotDialogOpen(false)
                    setEditingCourse(null)
                    loadCourses(token) // Reload courses
                    toast({
                      title: "Success",
                      description: `Course ${editingCourse ? 'updated' : 'created'} successfully`,
                    })
                  }} 
                />
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
            <Dialog 
              open={mapCourseDialogOpen} 
              onOpenChange={(open) => {
                setMapCourseDialogOpen(open)
                if (!open) setEditingMapping(null)
              }}
            >
              <DialogTrigger asChild>
                <Button 
                  className="gap-2"
                  onClick={() => setEditingMapping(null)}
                >
                  <Plus className="w-4 h-4" />
                  Map Course to University
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Map Course to University</DialogTitle>
                </DialogHeader>
                <MapCourseUniversityModal 
                  onSuccess={() => {
                    setMapCourseDialogOpen(false)
                    setEditingMapping(null)
                    toast({
                      title: "Success",
                      description: `Course mapping ${editingMapping ? 'updated' : 'created'} successfully`,
                    })
                  }} 
                />
              </DialogContent>
            </Dialog>
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
                    <TableHead>University Fee</TableHead>
                    <TableHead>Display Fee</TableHead>
                    <TableHead>Consultancy Share</TableHead>
                    <TableHead>Agent Commission</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {universityCourses.map((uc) => (
                    <TableRow key={uc.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{uc.course_name}</TableCell>
                      <TableCell>{uc.university_name}</TableCell>
                      <TableCell>₹{(uc.university_fee / 100000).toFixed(1)}L</TableCell>
                      <TableCell>₹{(uc.student_display_fee / 100000).toFixed(1)}L</TableCell>
                      <TableCell>₹{(uc.consultancy_share / 1000).toFixed(0)}K</TableCell>
                      <TableCell>₹{(uc.agent_commission / 1000).toFixed(0)}K</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                          {uc.fee_mode === "share_deduct" ? "Share Deduct" : "Full Fee"}
                        </span>
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
