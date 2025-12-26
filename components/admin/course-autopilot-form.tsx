"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Sparkles, AlertCircle, DollarSign, ChevronDown, ChevronRight, Settings, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface CourseAutopilotFormProps {
  onSuccess?: () => void
  editMode?: boolean
  courseData?: any
}

interface MasterCourse {
  id: string
  name: string
  abbreviation?: string
  level?: string
  department?: string
  duration?: string
  eligibility?: string[]
}

interface University {
  id: string
  name: string
}

interface CourseFormData {
  selectedMasterCourseId: string
  universityIds: string[]
  courseMode: string
  customDescription: string
  intakeCapacity: string
  availableSeats: string
  selectedAdmissionTypes: string[]
  totalCourseFee: string
  courseDuration: string
  requiredDocuments: string[]
  showOnApp: boolean
  courseStatus: string
}

export function CourseAutopilotForm({ onSuccess, editMode = false, courseData }: CourseAutopilotFormProps) {
  const [masterCourses, setMasterCourses] = useState<MasterCourse[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    fees: false,
    documents: false,
    facilities: false,
    timeline: false,
    visibility: false,
  })

  const [formData, setFormData] = useState<CourseFormData>({
    // SECTION A: Master Course Selection
    selectedMasterCourseId: "",
    universityIds: [],

    // SECTION B: Basic Information
    courseMode: 'Regular',
    customDescription: "",
    intakeCapacity: "",
    availableSeats: "",
    selectedAdmissionTypes: [],

    // SECTION C: Fee Structure
    totalCourseFee: "",
    courseDuration: "3",

    // SECTION D: Documents
    requiredDocuments: ["10th Marksheet", "12th Marksheet", "ID Proof"],

    // SECTION E: Advanced Settings
    showOnApp: true,
    courseStatus: 'Draft',
  })

  const [loading, setLoading] = useState(false)



  useEffect(() => {
    loadMasterCourses()
    loadUniversities()
  }, [])

  const loadMasterCourses = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('master_courses').select('*')
    if (data) setMasterCourses(data)
  }

  const loadUniversities = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('universities').select('id, name')
    if (data) setUniversities(data)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.selectedMasterCourseId) {
        alert('Please select a master course')
        setLoading(false)
        return
      }

      if (formData.universityIds.length === 0) {
        alert('Please select at least one university')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const inserts = formData.universityIds.map(uniId => ({
        university_id: uniId,
        master_course_id: formData.selectedMasterCourseId,
        university_fee: parseFloat(formData.totalCourseFee) || 0,
        display_fee: (parseFloat(formData.totalCourseFee) || 0) * 1.2, // Dummy margin logic
        intake_capacity: parseInt(formData.intakeCapacity) || 0,
        mode_of_study: formData.courseMode,
        is_active: formData.showOnApp,
        metadata: {
          description: formData.customDescription,
          admission_types: formData.selectedAdmissionTypes,
          required_documents: formData.requiredDocuments,
          duration: formData.courseDuration
        }
      }))

      const { error } = await supabase.from('university_courses').insert(inserts)

      if (error) throw error

      onSuccess?.()
    } catch (error: any) {
      console.error("Failed to save course mapping:", error)
      alert(`Failed to save course: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const selectedMasterCourse = masterCourses.find(c => c.id === formData.selectedMasterCourseId)

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <GraduationCap className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">{editMode ? "Edit" : "Add"} Course</h2>
          <p className="text-sm text-muted-foreground">Streamlined course setup with smart defaults</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SECTION 1: Master Course Selection */}
        <Card>
          <Collapsible open={expandedSections.basic} onOpenChange={() => toggleSection('basic')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium">Master Course Selection</span>
                </div>
                {expandedSections.basic ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Label htmlFor="university" className="text-base font-medium">Select Universities</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {universities.map((university) => (
                        <div key={university.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={university.id}
                            checked={formData.universityIds.includes(university.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  universityIds: [...formData.universityIds, university.id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  universityIds: formData.universityIds.filter(id => id !== university.id)
                                })
                              }
                            }}
                          />
                          <Label htmlFor={university.id} className="text-sm">{university.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="master_course" className="text-base font-medium">Select Course from Master Database *</Label>
                    <Select value={formData.selectedMasterCourseId} onValueChange={(value) => setFormData({ ...formData, selectedMasterCourseId: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a master course" />
                      </SelectTrigger>
                      <SelectContent>
                        {masterCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.abbreviation ?? course.name} - {course.level ?? ''} ({course.department ?? ''})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMasterCourse && (
                    <div className="lg:col-span-1">
                      <Card className="p-4 bg-blue-50 border-blue-200 h-fit">
                        <h4 className="font-medium text-blue-900 mb-2">Master Course Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Full Name:</strong> {selectedMasterCourse.name}</p>
                          <p><strong>Department:</strong> {selectedMasterCourse.department}</p>
                          <p><strong>Level:</strong> {selectedMasterCourse.level}</p>
                          <p><strong>Duration:</strong> {selectedMasterCourse.duration}</p>
                          <p><strong>Eligibility:</strong> {selectedMasterCourse.eligibility?.join(', ')}</p>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* SECTION 2: Basic Course Information */}
        <Card>
          <Collapsible open={expandedSections.fees} onOpenChange={() => toggleSection('fees')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Basic Information</span>
                </div>
                {expandedSections.fees ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="course_mode">Course Mode *</Label>
                    <Select value={formData.courseMode} onValueChange={(value) => setFormData({ ...formData, courseMode: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Distance">Distance</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="description">Custom Course Description</Label>
                    <Textarea
                      id="description"
                      value={formData.customDescription}
                      onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
                      placeholder="Add specific highlights of your program"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="intake">Intake Capacity *</Label>
                    <Input
                      id="intake"
                      type="number"
                      value={formData.intakeCapacity}
                      onChange={(e) => setFormData({ ...formData, intakeCapacity: e.target.value })}
                      placeholder="120"
                    />
                  </div>

                  <div>
                    <Label htmlFor="available">Available Seats</Label>
                    <Input
                      id="available"
                      type="number"
                      value={formData.availableSeats}
                      onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                      placeholder="100"
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <Label className="text-base font-medium">Admission Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Merit', 'Entrance', 'Direct', 'Management Quota'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={formData.selectedAdmissionTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  selectedAdmissionTypes: [...formData.selectedAdmissionTypes, type]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedAdmissionTypes: formData.selectedAdmissionTypes.filter(t => t !== type)
                                })
                              }
                            }}
                          />
                          <Label htmlFor={type} className="text-sm">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* SECTION 3: Fee Structure */}
        <Card>
          <Collapsible open={expandedSections.documents} onOpenChange={() => toggleSection('documents')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">Fee Structure</span>
                </div>
                {expandedSections.documents ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div>
                    <Label htmlFor="total_fee">Total Course Fee (₹) *</Label>
                    <Input
                      id="total_fee"
                      type="number"
                      value={formData.totalCourseFee}
                      onChange={(e) => setFormData({ ...formData, totalCourseFee: e.target.value })}
                      placeholder="400000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Course Duration (Years) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.courseDuration}
                      onChange={(e) => setFormData({ ...formData, courseDuration: e.target.value })}
                      placeholder="4"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    {formData.totalCourseFee && formData.courseDuration && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg h-full flex items-center">
                        <div>
                          <p className="text-sm font-medium text-green-800">Per Year Fee Calculation</p>
                          <p className="text-lg font-bold text-green-900">
                            ₹{((parseFloat(formData.totalCourseFee) || 0) / parseInt(formData.courseDuration)).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Total: ₹{formData.totalCourseFee} ÷ {formData.courseDuration} years
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* SECTION 4: Documents & Settings */}
        <Card>
          <Collapsible open={expandedSections.visibility} onOpenChange={() => toggleSection('visibility')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Documents & Settings</span>
                </div>
                {expandedSections.visibility ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Label className="text-base font-medium">Required Documents</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {['10th Marksheet', '12th Marksheet', 'ID Proof', 'Photo', 'Aadhar Card', 'Transfer Certificate'].map((doc) => (
                        <div key={doc} className="flex items-center space-x-2">
                          <Checkbox
                            id={doc}
                            checked={formData.requiredDocuments.includes(doc)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  requiredDocuments: [...formData.requiredDocuments, doc]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  requiredDocuments: formData.requiredDocuments.filter(d => d !== doc)
                                })
                              }
                            }}
                          />
                          <Label htmlFor={doc} className="text-sm">{doc}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show_on_app"
                        checked={formData.showOnApp}
                        onCheckedChange={(checked) => setFormData({ ...formData, showOnApp: checked as boolean })}
                      />
                      <Label htmlFor="show_on_app">Show on Student App</Label>
                    </div>

                    <div>
                      <Label htmlFor="course_status">Course Status</Label>
                      <Select value={formData.courseStatus} onValueChange={(value) => setFormData({ ...formData, courseStatus: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Preview/Summary */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <AlertCircle className="w-5 h-5 text-blue-600 mb-2" />
                <h4 className="font-semibold mb-2">Course Preview</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Universities:</strong> {formData.universityIds.map(id => universities.find(u => u.id === id)?.name).filter(Boolean).join(', ') || "None selected"}</p>
                  <p><strong>Master Course:</strong> {selectedMasterCourse?.name || "Not selected"}</p>
                  <p><strong>Mode:</strong> {formData.courseMode} | <strong>Duration:</strong> {formData.courseDuration} years</p>
                  <p><strong>Total Fee:</strong> ₹{formData.totalCourseFee || "0"} | <strong>Intake:</strong> {formData.intakeCapacity || "0"} students</p>
                  <p><strong>Admission Types:</strong> {formData.selectedAdmissionTypes.join(', ') || "None selected"}</p>
                  <p><strong>Documents Required:</strong> {formData.requiredDocuments.length} selected</p>
                  <p><strong>Status:</strong> {formData.courseStatus} | <strong>Visible:</strong> {formData.showOnApp ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <h4 className="font-semibold mb-2">Ready to Submit?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Review all information above. Make sure all required fields are filled before submitting.
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>• Master course selection is required</p>
                  <p>• Intake capacity and fee are mandatory</p>
                  <p>• Course will be saved as {formData.courseStatus.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onSuccess?.()}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setFormData({ ...formData, courseStatus: 'Draft' })}>
            Save as Draft
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>
    </div>
  )
}
