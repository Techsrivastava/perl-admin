"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, DollarSign, Users, GraduationCap, Settings, Eye, Loader2, Save, Trash2, Plus, Briefcase } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface CourseManagementModalProps {
    onSuccess?: () => void
    editData?: any
    mode?: "master" | "university"
}

export function CourseManagementModal({ onSuccess, editData, mode = "university" }: CourseManagementModalProps) {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [universities, setUniversities] = useState<any[]>([])
    const [masterCourses, setMasterCourses] = useState<any[]>([])

    const [formData, setFormData] = useState({
        // Master Course Link (Optional if creating new master too)
        master_course_id: editData?.master_course_id || "",

        // University Link (Required for university mode)
        university_id: editData?.university_id || "",

        // Basic Info (Manual)
        name: editData?.name || editData?.master_courses?.name || "",
        code: editData?.code || editData?.master_courses?.code || "",
        stream: editData?.stream || editData?.master_courses?.stream || "Engineering",
        level: editData?.level || editData?.master_courses?.level || "UG",
        duration: editData?.duration || editData?.master_courses?.duration || "4 Years",

        // Academic Details
        specialization: editData?.specialization || "",
        mode_of_study: editData?.mode_of_study || "regular",
        medium_of_instruction: editData?.medium_of_instruction || "English",
        semesters: editData?.semester_count || editData?.semesters || editData?.master_courses?.semesters || "8",
        entrance_exam: editData?.entrance_exam || "",

        // Financials
        university_fee: editData?.university_fee || "",
        display_fee: editData?.student_display_fee || editData?.display_fee || "",
        commission_type: editData?.commission_type || "percentage",
        commission_value: editData?.commission_value || "",

        // Capacity
        intake_capacity: editData?.intake_capacity || "",

        // Perks & Metadata
        hostel_available: editData?.hostel_available || false,
        scholarship_available: editData?.scholarship_available || false,

        description: editData?.metadata?.description || editData?.description || "",
        eligibility_criteria: editData?.eligibility_criteria ? editData.eligibility_criteria.join(', ') : "",
        is_active: editData?.is_active ?? true,

        // Placement
        avg_package: editData?.placement_stats?.avg_package || "",
        highest_package: editData?.placement_stats?.highest_package || "",
        // New Indian Context Fields
        approved_by: editData?.approved_by || "",
        naac_grade: editData?.naac_grade || "",
        cutoff_percentage: editData?.cutoff_percentage || "",
        admission_process: editData?.admission_process || "",
        hostel_fees: editData?.hostel_fees || "",
        loan_facility: editData?.loan_facility || "",
        average_package: editData?.average_package || "",
        placement_percentage: editData?.placement_percentage || "",
        top_recruiters: editData?.top_recruiters || "",
        infrastructure_rating: editData?.infrastructure_rating || "",

        // v16 New Fields - General/Meta
        abbreviation: editData?.abbreviation || "",
        affiliation: editData?.affiliation || "",
        year_of_establishment: editData?.year_of_establishment || "",
        accreditation: editData?.accreditation || "",
        recognized_by: editData?.recognized_by || "",
        autonomous_status: editData?.autonomous_status || "",
        nirf_ranking: editData?.nirf_ranking || "",

        // v16 - Academic & Curriculum
        course_type: editData?.course_type || "Full Time",
        exam_pattern: editData?.exam_pattern || "",
        grading_system: editData?.grading_system || "",
        attendance_requirement: editData?.attendance_requirement || "",
        project_work: editData?.project_work || "",
        internship_included: editData?.internship_included || false,
        industry_visits: editData?.industry_visits || false,
        guest_lectures: editData?.guest_lectures || false,
        workshops: editData?.workshops || false,
        seminars: editData?.seminars || false,

        // v16 - Faculty
        faculty_count: editData?.faculty_count || "",
        faculty_qualification: editData?.faculty_qualification || "",
        student_faculty_ratio: editData?.student_faculty_ratio || "",
        research_opportunities: editData?.research_opportunities || "",
        collaborations: editData?.collaborations ? (Array.isArray(editData.collaborations) ? editData.collaborations.join(', ') : editData.collaborations) : "",

        // v16 - Outcomes
        career_options: editData?.career_options ? (Array.isArray(editData.career_options) ? editData.career_options.join(', ') : editData.career_options) : "",
        job_prospects: editData?.job_prospects || "",
        higher_study_options: editData?.higher_study_options || "",
        certifications: editData?.certifications ? (Array.isArray(editData.certifications) ? editData.certifications.join(', ') : editData.certifications) : "",
        course_highlights: editData?.course_highlights ? (Array.isArray(editData.course_highlights) ? editData.course_highlights.join(', ') : editData.course_highlights) : "",
        course_outcomes: editData?.course_outcomes ? (Array.isArray(editData.course_outcomes) ? editData.course_outcomes.join(', ') : editData.course_outcomes) : "",

        // v16 - Facilities
        transport_facility: editData?.transport_facility || "",
        library_facility: editData?.library_facility || "",
        sports_facilities: editData?.sports_facilities || "",
        medical_facilities: editData?.medical_facilities || "",
        lab_facilities: editData?.lab_facilities || "",
        extracurricular_activities: editData?.extracurricular_activities ? (Array.isArray(editData.extracurricular_activities) ? editData.extracurricular_activities.join(', ') : editData.extracurricular_activities) : "",

        // v16 - Admission Extra
        documents_required: editData?.documents_required ? (Array.isArray(editData.documents_required) ? editData.documents_required.join(', ') : editData.documents_required) : "",
        reservation_policy: editData?.reservation_policy || "",
        scholarship_schemes: editData?.scholarship_schemes ? (Array.isArray(editData.scholarship_schemes) ? editData.scholarship_schemes.join(', ') : editData.scholarship_schemes) : "",
        fee_structure: editData?.fee_structure || "",
        alumni_network: editData?.alumni_network || "",
        nba_accreditation_validity: editData?.nba_accreditation_validity || "",
    })

    const supabase = createClient()

    useEffect(() => {
        loadReferenceData()
    }, [])

    const loadReferenceData = async () => {
        try {
            setFetching(true)
            const { data: uniData } = await supabase.from('universities').select('id, name').order('name')
            const { data: mastData } = await supabase.from('master_courses').select('*').order('name')

            setUniversities(uniData || [])
            setMasterCourses(mastData || [])
        } finally {
            setFetching(false)
        }
    }

    const [activeTab, setActiveTab] = useState("basic")
    const [createMapping, setCreateMapping] = useState(false) // Toggle for Master Mode one-shot creation

    const handleMasterCourseSelect = (id: string) => {
        const mc = masterCourses.find(c => c.id === id)
        if (mc) {
            setFormData(prev => ({
                ...prev,
                master_course_id: id,
                name: mc.name,
                code: mc.code || prev.code,
                stream: mc.stream || prev.stream,
                level: mc.level || prev.level,
                duration: mc.duration || prev.duration,
                semesters: mc.semesters || prev.semesters,
                description: mc.description || prev.description,
                // If master course has default values for these, we could map them, otherwise keep previous or default
                mode_of_study: mc.mode_of_study || prev.mode_of_study,
            }))
            // UX: Auto-switch to financial tab so user focuses on University specifics (Fees)
            setActiveTab("financial")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()

            // MODE A: MASTER COURSE CREATION / EDIT
            if (mode === 'master') {
                const payload = {
                    name: formData.name,
                    code: formData.code || `${formData.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                    stream: formData.stream,
                    level: formData.level,
                    duration: formData.duration,
                    semesters: parseInt(formData.semesters.toString()) || 0,
                    description: formData.description,
                    is_active: formData.is_active,

                    // Expanded Fields for Master Course (v17)
                    abbreviation: formData.abbreviation,
                    affiliation: formData.affiliation,
                    accreditation: formData.accreditation,
                    course_type: formData.course_type,
                    mode_of_study: formData.mode_of_study,

                    // Academic
                    medium_of_instruction: formData.medium_of_instruction,
                    exam_pattern: formData.exam_pattern,
                    grading_system: formData.grading_system,
                    attendance_requirement: formData.attendance_requirement,
                    total_seats: parseInt(formData.intake_capacity.toString()) || 0, // Mapping intake to total_seats
                    course_fees: parseFloat(formData.university_fee.toString()) || 0, // Mapping fee

                    // Admissions
                    eligibility_criteria: typeof formData.eligibility_criteria === 'string' ? formData.eligibility_criteria.split(',').map(s => s.trim()).filter(Boolean) : [],
                    admission_process: formData.admission_process,
                    entrance_exam: formData.entrance_exam,
                    documents_required: typeof formData.documents_required === 'string' ? formData.documents_required.split(',').map(s => s.trim()).filter(Boolean) : [],
                    reservation_policy: formData.reservation_policy,

                    // Outcomes
                    career_options: typeof formData.career_options === 'string' ? formData.career_options.split(',').map(s => s.trim()).filter(Boolean) : [],
                    job_prospects: formData.job_prospects,
                    higher_study_options: formData.higher_study_options,
                    internship_included: formData.internship_included,

                    // Exposure (Booleans)
                    industrial_visits: formData.industry_visits,
                    seminars_workshops: formData.seminars,
                    research_opportunities: formData.research_opportunities,

                    // Facilities (Booleans)
                    transport_facility: formData.transport_facility,
                    hostel_facility: formData.hostel_available,
                    library_facility: formData.library_facility,
                    lab_facilities: formData.lab_facilities,
                    sports_facilities: formData.sports_facilities,
                    wifi_campus: false, // Default

                    // Placement
                    average_package: parseFloat(formData.average_package.toString()) || 0,
                    highest_package: parseFloat(formData.highest_package.toString()) || 0,
                    placement_percentage: parseInt(formData.placement_percentage.toString()) || 0,
                    top_recruiters: typeof formData.top_recruiters === 'string' ? formData.top_recruiters.split(',').map(s => s.trim()).filter(Boolean) : [],

                    // Meta
                    course_highlights: typeof formData.course_highlights === 'string' ? formData.course_highlights.split(',').map(s => s.trim()).filter(Boolean) : [],
                    certifications: typeof formData.certifications === 'string' ? formData.certifications.split(',').map(s => s.trim()).filter(Boolean) : []
                }

                if (editData && editData.id) {
                    const { error } = await supabase.from('master_courses').update(payload).eq('id', editData.id)
                    if (error) throw error
                } else {
                    const { error } = await supabase.from('master_courses').insert(payload)
                    if (error) throw error
                }
            }


            // MODE B: UNIVERSITY COURSE MAPPING
            else if (mode === 'university') {
                if (!formData.university_id || !formData.master_course_id) {
                    throw new Error("University and Master Course are required for mapping.")
                }

                const payload = {
                    university_id: formData.university_id,
                    master_course_id: formData.master_course_id,

                    // Financials
                    university_fee: parseFloat(formData.university_fee.toString()) || 0,
                    display_fee: parseFloat(formData.display_fee.toString()) || 0,
                    commission_type: formData.commission_type,
                    commission_value: parseFloat(formData.commission_value.toString()) || 0,
                    hostel_fees: parseFloat(formData.hostel_fees.toString()) || 0,

                    // Academic Specifics
                    intake_capacity: parseInt(formData.intake_capacity.toString()) || 0,
                    mode_of_study: formData.mode_of_study,
                    specialization: formData.specialization,
                    medium_of_instruction: formData.medium_of_instruction,
                    semester_count: parseInt(formData.semesters.toString()) || 0,

                    // Admission
                    entrance_exam: formData.entrance_exam,
                    cutoff_percentage: parseFloat(formData.cutoff_percentage.toString()) || 0,
                    admission_process: formData.admission_process,
                    eligibility_criteria: typeof formData.eligibility_criteria === 'string' ? formData.eligibility_criteria.split(',').map(s => s.trim()).filter(Boolean) : [],

                    // Placement
                    average_package: parseFloat(formData.average_package.toString()) || 0,
                    highest_package: parseFloat(formData.highest_package.toString()) || 0,
                    placement_percentage: parseInt(formData.placement_percentage.toString()) || 0,
                    top_recruiters: typeof formData.top_recruiters === 'string'
                        ? formData.top_recruiters.split(',').map(s => s.trim()).filter(Boolean)
                        : [],

                    // Infrastructure & Extras
                    hostel_available: formData.hostel_available,
                    scholarship_available: formData.scholarship_available,
                    loan_facility: formData.loan_facility,
                    infrastructure_rating: formData.infrastructure_rating,

                    // Approvals
                    approved_by: formData.approved_by,
                    naac_grade: formData.naac_grade,

                    is_active: formData.is_active,
                    metadata: { description: formData.description },

                    // v16 Fields Payload
                    abbreviation: formData.abbreviation,
                    affiliation: formData.affiliation,
                    year_of_establishment: parseInt(formData.year_of_establishment.toString()) || null,
                    accreditation: formData.accreditation,
                    recognized_by: formData.recognized_by,
                    autonomous_status: formData.autonomous_status,
                    nirf_ranking: parseInt(formData.nirf_ranking.toString()) || null,

                    course_type: formData.course_type,
                    exam_pattern: formData.exam_pattern,
                    grading_system: formData.grading_system,
                    attendance_requirement: formData.attendance_requirement,
                    project_work: formData.project_work,
                    internship_included: formData.internship_included,
                    industry_visits: formData.industry_visits,
                    guest_lectures: formData.guest_lectures,
                    workshops: formData.workshops,
                    seminars: formData.seminars,

                    faculty_count: parseInt(formData.faculty_count.toString()) || 0,
                    faculty_qualification: formData.faculty_qualification,
                    student_faculty_ratio: formData.student_faculty_ratio,
                    research_opportunities: formData.research_opportunities,
                    collaborations: typeof formData.collaborations === 'string' ? formData.collaborations.split(',').map(s => s.trim()).filter(Boolean) : [],

                    career_options: typeof formData.career_options === 'string' ? formData.career_options.split(',').map(s => s.trim()).filter(Boolean) : [],
                    job_prospects: formData.job_prospects,
                    higher_study_options: formData.higher_study_options,
                    certifications: typeof formData.certifications === 'string' ? formData.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
                    course_highlights: typeof formData.course_highlights === 'string' ? formData.course_highlights.split(',').map(s => s.trim()).filter(Boolean) : [],
                    course_outcomes: typeof formData.course_outcomes === 'string' ? formData.course_outcomes.split(',').map(s => s.trim()).filter(Boolean) : [],

                    transport_facility: formData.transport_facility,
                    library_facility: formData.library_facility,
                    sports_facilities: formData.sports_facilities,
                    medical_facilities: formData.medical_facilities,
                    lab_facilities: formData.lab_facilities,
                    extracurricular_activities: typeof formData.extracurricular_activities === 'string' ? formData.extracurricular_activities.split(',').map(s => s.trim()).filter(Boolean) : [],

                    documents_required: typeof formData.documents_required === 'string' ? formData.documents_required.split(',').map(s => s.trim()).filter(Boolean) : [],
                    reservation_policy: formData.reservation_policy,
                    scholarship_schemes: typeof formData.scholarship_schemes === 'string' ? formData.scholarship_schemes.split(',').map(s => s.trim()).filter(Boolean) : [],
                    fee_structure: formData.fee_structure,
                    alumni_network: formData.alumni_network,
                    nba_accreditation_validity: formData.nba_accreditation_validity
                }

                if (editData && editData.id) {
                    const { error } = await supabase.from('university_courses').update(payload).eq('id', editData.id)
                    if (error) throw error
                } else {
                    const { error } = await supabase.from('university_courses').insert(payload)
                    if (error) throw error
                }
            }

            alert(`Course ${editData ? 'updated' : 'created'} successfully!`)
            onSuccess?.()
        } catch (error: any) {
            console.error("Course Save Error:", JSON.stringify(error, null, 2))
            if (error?.code === '23505') {
                alert("A course with this code already exists. Please use a unique code.")
            } else {
                alert("Error: " + (error.message || "Unknown error occurred. Check console."))
            }
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto px-1 pb-10 scrollbar-hide">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full h-12 bg-muted p-1 rounded-xl overflow-x-auto grid-cols-6">
                    <TabsTrigger value="basic" className="rounded-lg font-bold text-xs">General</TabsTrigger>
                    <TabsTrigger value="academic" className="rounded-lg font-bold text-xs">Academic</TabsTrigger>
                    <TabsTrigger value="faculty" className="rounded-lg font-bold text-xs">Faculty</TabsTrigger>
                    <TabsTrigger value="campus" className="rounded-lg font-bold text-xs">Campus</TabsTrigger>
                    <TabsTrigger value="outcomes" className="rounded-lg font-bold text-xs">Outcomes</TabsTrigger>
                    <TabsTrigger value="financial" className="rounded-lg font-bold text-xs">Financial</TabsTrigger>
                </TabsList>

                {/* Tab 1: General Info */}
                <TabsContent value="basic" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    {mode === 'master' && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <p><strong>Master Course Definition:</strong> Define comprehensive Master Course data here (Fees, Eligibility, etc). These will act as global defaults.</p>
                        </div>
                    )}
                    <Card className="border-none shadow-sm bg-muted/20">
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {mode === 'university' && (
                                    <>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <Label className="font-bold">Select University *</Label>
                                            <Select value={formData.university_id} onValueChange={(v: string) => setFormData({ ...formData, university_id: v })} required>
                                                <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Choose University" /></SelectTrigger>
                                                <SelectContent>
                                                    {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <Label className="font-bold">Select Master Course *</Label>
                                            <Select value={formData.master_course_id} onValueChange={handleMasterCourseSelect} required>
                                                <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select Course" /></SelectTrigger>
                                                <SelectContent>
                                                    {masterCourses.map(mc => <SelectItem key={mc.id} value={mc.id}>{mc.name} ({mc.stream})</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <Label className="font-bold">Course Name *</Label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`h-11 bg-white ${mode === 'university' ? 'bg-muted' : ''}`} disabled={mode === 'university'} required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Abbreviation</Label>
                                    <Input value={formData.abbreviation} onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })} className="h-11 bg-white" placeholder="e.g. CSE" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Type / Level</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select value={formData.stream} onValueChange={(v) => setFormData({ ...formData, stream: v })} disabled={mode === 'university'}>
                                            <SelectTrigger className={`h-11 bg-white ${mode === 'university' ? 'bg-muted' : ''}`}><SelectValue /></SelectTrigger>
                                            <SelectContent>{['Engineering', 'Management', 'Medical', 'Arts', 'Commerce', 'Science', 'Law'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })} disabled={mode === 'university'}>
                                            <SelectTrigger className={`h-11 bg-white ${mode === 'university' ? 'bg-muted' : ''}`}><SelectValue /></SelectTrigger>
                                            <SelectContent>{['UG', 'PG', 'Diploma', 'Phd', 'Certificate'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Affiliated To</Label>
                                    <Input value={formData.affiliation} onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })} className="h-11 bg-white" placeholder="e.g. ABC University" />
                                </div>

                                {mode === 'university' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="font-bold text-xs">Est. Year</Label>
                                                <Input type="number" value={formData.year_of_establishment} onChange={(e) => setFormData({ ...formData, year_of_establishment: e.target.value })} className="h-11 bg-white" placeholder="1995" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-xs">NIRF Rank</Label>
                                                <Input type="number" value={formData.nirf_ranking} onChange={(e) => setFormData({ ...formData, nirf_ranking: e.target.value })} className="h-11 bg-white" placeholder="25" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">Accreditation & Approvals</Label>
                                            <Input value={formData.accreditation} onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })} className="h-11 bg-white" placeholder="NAAC A+, NBA" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <Separator />
                            <div className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    {formData.is_active ? <span className="w-2 h-2 rounded-full bg-green-500" /> : <span className="w-2 h-2 rounded-full bg-red-500" />}
                                    Current Status: {formData.is_active ? "Active" : "Inactive"}
                                </Label>
                                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} className="data-[state=checked]:bg-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Academic */}
                <TabsContent value="academic" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-5 space-y-4">
                            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Structure</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Duration</Label>
                                    <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} disabled={mode === 'university'} className={mode === 'university' ? 'bg-muted' : ''} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Semesters</Label>
                                    <Input value={formData.semesters} onChange={e => setFormData({ ...formData, semesters: e.target.value })} disabled={mode === 'university'} className={mode === 'university' ? 'bg-muted' : ''} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Study Mode</Label>
                                    <Select value={formData.mode_of_study} onValueChange={v => setFormData({ ...formData, mode_of_study: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{['Regular', 'Distance', 'Online', 'Part Time'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Course Type</Label>
                                    <Select value={formData.course_type} onValueChange={v => setFormData({ ...formData, course_type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{['Full Time', 'Part Time', 'Diploma', 'Certification'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Specialization</Label>
                                <Input value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g. Artificial Intelligence" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Exam Pattern</Label>
                                    <Input value={formData.exam_pattern} onChange={e => setFormData({ ...formData, exam_pattern: e.target.value })} placeholder="Semester / Annual" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Grading</Label>
                                    <Input value={formData.grading_system} onChange={e => setFormData({ ...formData, grading_system: e.target.value })} placeholder="CGPA / Percentage" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Attendance Req.</Label>
                                <Input value={formData.attendance_requirement} onChange={e => setFormData({ ...formData, attendance_requirement: e.target.value })} placeholder="e.g. 75% Mandatory" />
                            </div>
                        </Card>

                        <Card className="p-5 space-y-4">
                            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Admissions & Exposure</h4>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Entrance Exams</Label>
                                <Input value={formData.entrance_exam} onChange={e => setFormData({ ...formData, entrance_exam: e.target.value })} placeholder="JEE, CAT, GMAT" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Eligibility Criteria</Label>
                                <Textarea value={formData.eligibility_criteria} onChange={e => setFormData({ ...formData, eligibility_criteria: e.target.value })} placeholder="Min 60% in PCM..." rows={2} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Admission Process</Label>
                                <Textarea value={formData.admission_process} onChange={e => setFormData({ ...formData, admission_process: e.target.value })} placeholder="1. Form 2. Exam 3. Interview" rows={2} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Documents Required</Label>
                                <Input value={formData.documents_required} onChange={e => setFormData({ ...formData, documents_required: e.target.value })} placeholder="Comma separated list" />
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center justify-between border p-2 rounded"><Label>Incls Internship</Label> <Switch checked={formData.internship_included} onCheckedChange={v => setFormData({ ...formData, internship_included: v })} /></div>
                                <div className="flex items-center justify-between border p-2 rounded"><Label>Indus. Visits</Label> <Switch checked={formData.industry_visits} onCheckedChange={v => setFormData({ ...formData, industry_visits: v })} /></div>
                                <div className="flex items-center justify-between border p-2 rounded"><Label>Guest Lec.</Label> <Switch checked={formData.guest_lectures} onCheckedChange={v => setFormData({ ...formData, guest_lectures: v })} /></div>
                                <div className="flex items-center justify-between border p-2 rounded"><Label>Seminars</Label> <Switch checked={formData.seminars} onCheckedChange={v => setFormData({ ...formData, seminars: v })} /></div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab 3: Faculty */}
                <TabsContent value="faculty" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label className="font-bold">Faculty Count</Label><Input type="number" value={formData.faculty_count} onChange={e => setFormData({ ...formData, faculty_count: e.target.value })} /></div>
                                    <div className="space-y-2"><Label className="font-bold">Student-Faculty Ratio</Label><Input value={formData.student_faculty_ratio} onChange={e => setFormData({ ...formData, student_faculty_ratio: e.target.value })} placeholder="1:20" /></div>
                                </div>
                                <div className="space-y-2"><Label className="font-bold">Faculty Qualifications</Label><Input value={formData.faculty_qualification} onChange={e => setFormData({ ...formData, faculty_qualification: e.target.value })} placeholder="Ph.D, M.Tech, Industry Exp" /></div>
                                <div className="space-y-2"><Label className="font-bold">Collaborations</Label><Textarea value={formData.collaborations} onChange={e => setFormData({ ...formData, collaborations: e.target.value })} placeholder="International Universities, Industry Partners (Comma sep)" /></div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold">Research Opportunities</Label>
                                <Textarea value={formData.research_opportunities} onChange={e => setFormData({ ...formData, research_opportunities: e.target.value })} className="h-full min-h-[150px]" placeholder="Details about research labs, funding, and areas of focus..." />
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Tab 4: Campus & Facilities */}
                <TabsContent value="campus" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm border-b pb-2">Facilities Overview</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label className="text-xs">Hostel</Label><Switch checked={formData.hostel_available} onCheckedChange={v => setFormData({ ...formData, hostel_available: v })} /></div>
                                    <div className="space-y-1"><Label className="text-xs">Transport</Label><Input value={formData.transport_facility} onChange={e => setFormData({ ...formData, transport_facility: e.target.value })} className="h-8" /></div>
                                    <div className="space-y-1"><Label className="text-xs">Library</Label><Input value={formData.library_facility} onChange={e => setFormData({ ...formData, library_facility: e.target.value })} className="h-8" /></div>
                                    <div className="space-y-1"><Label className="text-xs">Sports</Label><Input value={formData.sports_facilities} onChange={e => setFormData({ ...formData, sports_facilities: e.target.value })} className="h-8" /></div>
                                    <div className="space-y-1"><Label className="text-xs">Medical</Label><Input value={formData.medical_facilities} onChange={e => setFormData({ ...formData, medical_facilities: e.target.value })} className="h-8" /></div>
                                </div>
                                <div className="space-y-2"><Label className="text-xs font-bold">Labs & Equipment</Label><Textarea value={formData.lab_facilities} onChange={e => setFormData({ ...formData, lab_facilities: e.target.value })} rows={3} placeholder="Computer Labs, Physics Lab..." /></div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm border-b pb-2">Experience</h4>
                                <div className="space-y-2"><Label className="text-xs font-bold">Extracurriculars</Label><Textarea value={formData.extracurricular_activities} onChange={e => setFormData({ ...formData, extracurricular_activities: e.target.value })} rows={3} placeholder="Clubs, Events, Fests..." /></div>
                                <div className="space-y-2"><Label className="text-xs font-bold">Alumni Network</Label><Textarea value={formData.alumni_network} onChange={e => setFormData({ ...formData, alumni_network: e.target.value })} rows={2} placeholder="Strong network of 5000+ alumni..." /></div>
                                <div className="space-y-2"><Label className="text-xs font-bold">Infrastructure Rating / Highlights</Label><Input value={formData.infrastructure_rating} onChange={e => setFormData({ ...formData, infrastructure_rating: e.target.value })} placeholder="WiFi Enabled Campus, Smart Classrooms" /></div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Tab 5: Placement & Outcomes */}
                <TabsContent value="outcomes" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Placement Stats</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1"><Label className="text-[10px] font-bold">Highest (LPA)</Label><Input type="number" value={formData.highest_package} onChange={e => setFormData({ ...formData, highest_package: e.target.value })} /></div>
                                    <div className="space-y-1"><Label className="text-[10px] font-bold">Avg (LPA)</Label><Input type="number" value={formData.average_package} onChange={e => setFormData({ ...formData, average_package: e.target.value })} /></div>
                                    <div className="space-y-1"><Label className="text-[10px] font-bold">Rate (%)</Label><Input type="number" value={formData.placement_percentage} onChange={e => setFormData({ ...formData, placement_percentage: e.target.value })} /></div>
                                </div>
                                <div className="space-y-2"><Label className="text-xs font-bold">Top Recruiters</Label><Textarea value={formData.top_recruiters} onChange={e => setFormData({ ...formData, top_recruiters: e.target.value })} placeholder="Google, Amazon, TCS..." rows={3} /></div>
                                <div className="space-y-2"><Label className="text-xs font-bold">Job Prospects</Label><Textarea value={formData.job_prospects} onChange={e => setFormData({ ...formData, job_prospects: e.target.value })} placeholder="Software Engineer, Data Analyst..." rows={2} /></div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm border-b pb-2">Future Scope</h4>
                                <div className="space-y-2"><Label className="text-xs font-bold">Career Options</Label><Textarea value={formData.career_options} onChange={e => setFormData({ ...formData, career_options: e.target.value })} placeholder="Comma separated list..." rows={2} /></div>
                                <div className="space-y-2"><Label className="text-xs font-bold">Higher Study Options</Label><Input value={formData.higher_study_options} onChange={e => setFormData({ ...formData, higher_study_options: e.target.value })} placeholder="M.Tech, MBA, Ph.D" /></div>
                                <div className="space-y-2"><Label className="text-xs font-bold">Certifications Offered</Label><Input value={formData.certifications} onChange={e => setFormData({ ...formData, certifications: e.target.value })} placeholder="AWS, PMP, Cisco" /></div>
                                <div className="space-y-2"><Label className="text-xs font-bold">Key Highlights</Label><Textarea value={formData.course_highlights} onChange={e => setFormData({ ...formData, course_highlights: e.target.value })} rows={2} /></div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Tab 6: Financials */}
                <TabsContent value="financial" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <Card className="p-8 border-none shadow-sm bg-primary/5 border border-primary/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base font-black flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> University Net Fee</Label>
                                    <Input type="number" value={formData.university_fee} onChange={e => setFormData({ ...formData, university_fee: e.target.value })} className="h-14 text-2xl font-black bg-white border-primary/20" placeholder="0.00" />
                                </div>
                                <div className="bg-white p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm">
                                    <Label className="text-base font-black text-red-600 flex items-center gap-2">Admin Control: Student Display Fee</Label>
                                    <p className="text-xs text-muted-foreground mb-2">Only Super Admin can edit this field.</p>
                                    <Input type="number" value={formData.display_fee} onChange={e => setFormData({ ...formData, display_fee: e.target.value })} className="h-14 text-2xl font-black bg-slate-50 border-primary/20 text-green-700" placeholder="0.00" />
                                </div>
                                <div className="space-y-2"><Label className="font-bold">Fee Structure URL / Details</Label><Input value={formData.fee_structure} onChange={e => setFormData({ ...formData, fee_structure: e.target.value })} placeholder="Link or info" /></div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Hostel & Loans</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label className="font-bold">Hostel Fees</Label><Input type="number" value={formData.hostel_fees} onChange={e => setFormData({ ...formData, hostel_fees: e.target.value })} /></div>
                                        <div className="space-y-2"><Label className="font-bold">Loans?</Label><Input value={formData.loan_facility} onChange={e => setFormData({ ...formData, loan_facility: e.target.value })} /></div>
                                    </div>
                                    <div className="space-y-2"><Label className="font-bold">Scholarship Schemes</Label><Textarea value={formData.scholarship_schemes} onChange={e => setFormData({ ...formData, scholarship_schemes: e.target.value })} placeholder="Merit-based, Sports quota..." rows={2} /></div>
                                </div>
                                <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Partner Settlements</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label className="font-bold">Type</Label><Select value={formData.commission_type} onValueChange={(v: string) => setFormData({ ...formData, commission_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="flat">Flat</SelectItem></SelectContent></Select></div>
                                        <div className="space-y-2"><Label className="font-bold">Value</Label><Input type="number" value={formData.commission_value} onChange={e => setFormData({ ...formData, commission_value: e.target.value })} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="pt-6 border-t sticky bottom-0 bg-white pb-4 z-20 flex gap-4">
                <Button type="button" variant="ghost" className="flex-1 h-12 font-bold" onClick={() => onSuccess?.()}>Cancel</Button>
                <Button type="submit" className="flex-[2] h-12 font-black text-lg bg-primary shadow-xl shadow-primary/20" disabled={loading || (mode === 'university' && (!formData.university_id || !formData.master_course_id)) || (mode === 'master' && !formData.name)}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    {editData ? "Update Data" : (mode === 'university' ? "Map Course" : "Create Master Course")}
                </Button>
            </div>
        </form>
    )
}
