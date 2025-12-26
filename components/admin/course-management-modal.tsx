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
import { BookOpen, DollarSign, Users, GraduationCap, Settings, Eye, Loader2, Save, Trash2, Plus } from "lucide-react"
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
        semesters: editData?.semesters || editData?.master_courses?.semesters || "8",
        entrance_exam: editData?.entrance_exam || "",

        // Financials
        university_fee: editData?.university_fee || "",
        display_fee: editData?.display_fee || "",
        commission_type: editData?.commission_type || "percentage",
        commission_value: editData?.commission_value || "",

        // Capacity
        intake_capacity: editData?.intake_capacity || "",

        // Perks & Metadata
        hostel_available: editData?.hostel_available || false,
        scholarship_available: editData?.scholarship_available || false,
        description: editData?.metadata?.description || editData?.description || "",
        is_active: editData?.is_active ?? true,

        // Placement
        avg_package: editData?.placement_stats?.avg_package || "",
        highest_package: editData?.placement_stats?.highest_package || "",
    })

    const supabase = createClient()

    useEffect(() => {
        loadReferenceData()
    }, [])

    const loadReferenceData = async () => {
        try {
            setFetching(true)
            const { data: uniData } = await supabase.from('universities').select('id, name').order('name')
            const { data: mastData } = await supabase.from('master_courses').select('id, name, stream, level, duration').order('name')

            setUniversities(uniData || [])
            setMasterCourses(mastData || [])
        } finally {
            setFetching(false)
        }
    }

    const handleMasterCourseSelect = (id: string) => {
        const mc = masterCourses.find(c => c.id === id)
        if (mc) {
            setFormData({
                ...formData,
                master_course_id: id,
                name: mc.name,
                stream: mc.stream || formData.stream,
                level: mc.level || formData.level,
                duration: mc.duration || formData.duration,
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Ensure Master Course Exists (or Create if not selected but name provided)
            let masterId = formData.master_course_id

            if (!masterId || masterId === "manual_entry") {
                // Create new master course record only if we don't have one
                const { data: newMaster, error: mError } = await supabase
                    .from('master_courses')
                    .insert({
                        name: formData.name,
                        code: formData.code || `${formData.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                        stream: formData.stream,
                        level: formData.level,
                        duration: formData.duration,
                        is_active: true
                    })
                    .select()
                    .single()

                if (mError) throw mError
                masterId = newMaster.id
            } else {
                // Update existing master course record to keep it in sync
                const { error: mUpdateError } = await supabase
                    .from('master_courses')
                    .update({
                        name: formData.name,
                        code: formData.code,
                        stream: formData.stream,
                        level: formData.level,
                        duration: formData.duration
                    })
                    .eq('id', masterId)

                if (mUpdateError) throw mUpdateError
            }

            // 2. Insert/Update University Course Mapping
            if (formData.university_id) {
                const payload = {
                    university_id: formData.university_id,
                    master_course_id: masterId,
                    university_fee: parseFloat(formData.university_fee.toString()) || 0,
                    display_fee: parseFloat(formData.display_fee.toString()) || 0,
                    commission_type: formData.commission_type,
                    commission_value: parseFloat(formData.commission_value.toString()) || 0,
                    intake_capacity: parseInt(formData.intake_capacity.toString()) || 0,
                    specialization: formData.specialization,
                    mode_of_study: formData.mode_of_study,
                    medium_of_instruction: formData.medium_of_instruction,
                    entrance_exam: formData.entrance_exam,
                    hostel_available: formData.hostel_available,
                    scholarship_available: formData.scholarship_available,
                    is_active: formData.is_active,
                    placement_stats: {
                        avg_package: formData.avg_package,
                        highest_package: formData.highest_package
                    },
                    metadata: {
                        description: formData.description
                    }
                }

                if (editData && editData.id) {
                    const { error: uError } = await supabase
                        .from('university_courses')
                        .update(payload)
                        .eq('id', editData.id)
                    if (uError) throw uError
                } else {
                    const { error: uError } = await supabase
                        .from('university_courses')
                        .insert(payload)
                    if (uError) throw uError
                }
            }

            alert(`Course ${editData ? 'updated' : 'created'} successfully!`)
            onSuccess?.()
        } catch (error: any) {
            console.error("Course Save Error:", error)
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto px-1 pb-10 scrollbar-hide">
            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-12 bg-muted p-1 rounded-xl">
                    <TabsTrigger value="basic" className="rounded-lg font-bold">General</TabsTrigger>
                    <TabsTrigger value="academic" className="rounded-lg font-bold">Academic</TabsTrigger>
                    <TabsTrigger value="financial" className="rounded-lg font-bold">Financial</TabsTrigger>
                    <TabsTrigger value="config" className="rounded-lg font-bold">Config</TabsTrigger>
                </TabsList>

                {/* Tab 1: Basic Info */}
                <TabsContent value="basic" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <Card className="border-none shadow-sm bg-muted/20">
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label className="font-bold">Select University *</Label>
                                    <Select value={formData.university_id} onValueChange={(v: string) => setFormData({ ...formData, university_id: v })}>
                                        <SelectTrigger className="h-12 bg-white">
                                            <SelectValue placeholder="Choose a university destination" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label className="font-bold">Link to Master Database (Optional Template)</Label>
                                    <Select value={formData.master_course_id} onValueChange={handleMasterCourseSelect}>
                                        <SelectTrigger className="h-12 bg-white">
                                            <SelectValue placeholder="Pick a template or enter manually below" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual_entry"><span className="text-primary italic">+ Manual New Entry</span></SelectItem>
                                            {masterCourses.map(mc => <SelectItem key={mc.id} value={mc.id}>{mc.name} ({mc.stream})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">Course Name *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12 bg-white"
                                        placeholder="e.g. Master of Computer Applications"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">Course Code</Label>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="h-12 bg-white"
                                        placeholder="MCA-202"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">Stream / Department</Label>
                                    <Select value={formData.stream} onValueChange={(v: string) => setFormData({ ...formData, stream: v })}>
                                        <SelectTrigger className="h-12 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Engineering', 'Management', 'Medical', 'Arts', 'Commerce', 'Science', 'Law', 'Other'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">Course Level</Label>
                                    <Select value={formData.level} onValueChange={(v: string) => setFormData({ ...formData, level: v })}>
                                        <SelectTrigger className="h-12 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['UG', 'PG', 'Diploma', 'Phd', 'Certificate'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Academic Details */}
                <TabsContent value="academic" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 space-y-4">
                            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" /> Academic Structure
                            </h4>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Duration</Label>
                                    <Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="bg-muted/10 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Specialization</Label>
                                    <Input value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="bg-muted/10 h-11" placeholder="e.g. Artificial Intelligence" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Study Mode</Label>
                                    <Select value={formData.mode_of_study} onValueChange={(v: string) => setFormData({ ...formData, mode_of_study: v })}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['regular', 'distance', 'online', 'part-time'].map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-primary" /> Admission Requirements
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Entrance Exam Requirement</Label>
                                    <Input value={formData.entrance_exam} onChange={e => setFormData({ ...formData, entrance_exam: e.target.value })} className="bg-muted/10 h-11" placeholder="e.g. JEE Main, CUET" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Instruction Medium</Label>
                                    <Input value={formData.medium_of_instruction} onChange={e => setFormData({ ...formData, medium_of_instruction: e.target.value })} className="bg-muted/10 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Intake Capacity</Label>
                                    <Input type="number" value={formData.intake_capacity} onChange={e => setFormData({ ...formData, intake_capacity: e.target.value })} className="bg-muted/10 h-11" placeholder="Total available seats" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab 3: Financials */}
                <TabsContent value="financial" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <Card className="p-8 border-none shadow-sm bg-primary/5 border border-primary/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base font-black flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-primary" /> University Net Fee *
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Amount payable to the university</p>
                                    <Input
                                        type="number"
                                        value={formData.university_fee}
                                        onChange={e => setFormData({ ...formData, university_fee: e.target.value })}
                                        className="h-14 text-2xl font-black bg-white border-primary/20 shadow-sm"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-base font-black">Student Display Fee *</Label>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Public price shown on student portal</p>
                                    <Input
                                        type="number"
                                        value={formData.display_fee}
                                        onChange={e => setFormData({ ...formData, display_fee: e.target.value })}
                                        className="h-14 text-2xl font-black bg-white border-primary/20 shadow-sm text-green-700"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Partner Settlements</h4>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Commission Protocol</Label>
                                        <Select value={formData.commission_type} onValueChange={(v: string) => setFormData({ ...formData, commission_type: v })}>
                                            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage based</SelectItem>
                                                <SelectItem value="flat">Flat amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold">Commission Value ({formData.commission_type === 'percentage' ? '%' : '₹'})</Label>
                                        <Input
                                            type="number"
                                            value={formData.commission_value}
                                            onChange={e => setFormData({ ...formData, commission_value: e.target.value })}
                                            className="h-12 font-black text-lg"
                                        />
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-dashed">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-muted-foreground">Est. Pipeline Gross:</span>
                                            <span className="font-black text-primary text-lg">
                                                ₹{(Number(formData.display_fee) - Number(formData.university_fee)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Tab 4: Config & Perks */}
                <TabsContent value="config" className="mt-6 space-y-6 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 space-y-6">
                            <h4 className="font-bold text-sm uppercase tracking-widest">Campus Features</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                                    <Label className="font-medium">Residential/Hostel Facility</Label>
                                    <Switch checked={formData.hostel_available} onCheckedChange={(v: boolean) => setFormData({ ...formData, hostel_available: v })} />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                                    <Label className="font-medium">Financial Aid/Scholarships</Label>
                                    <Switch checked={formData.scholarship_available} onCheckedChange={(v: boolean) => setFormData({ ...formData, scholarship_available: v })} />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
                                    <Label className="font-bold text-primary">Active for Admissions</Label>
                                    <Switch checked={formData.is_active} onCheckedChange={(v: boolean) => setFormData({ ...formData, is_active: v })} />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h4 className="font-bold text-sm uppercase tracking-widest">Placement Highlights</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground">Average CTC (₹)</Label>
                                    <Input value={formData.avg_package} onChange={e => setFormData({ ...formData, avg_package: e.target.value })} className="h-10" placeholder="e.g. 6LPA" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground">Highest CTC (₹)</Label>
                                    <Input value={formData.highest_package} onChange={e => setFormData({ ...formData, highest_package: e.target.value })} className="h-10" placeholder="e.g. 45LPA" />
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label className="font-bold">Course Meta Narrative</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    placeholder="Write a compelling overview of this course..."
                                    className="text-sm bg-muted/10"
                                />
                            </div>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="pt-6 border-t sticky bottom-0 bg-white pb-4 z-20 flex gap-4">
                <Button type="button" variant="ghost" className="flex-1 h-12 font-bold" onClick={() => onSuccess?.()}>Cancel</Button>
                <Button
                    type="submit"
                    className="flex-[2] h-12 font-black text-lg bg-primary shadow-xl shadow-primary/20"
                    disabled={loading || !formData.university_id || !formData.name}
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    {editData ? "Update Production Logic" : "Deploy New Course"}
                </Button>
            </div>
        </form>
    )
}
