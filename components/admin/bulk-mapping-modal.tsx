import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase"
import { Loader2, CheckCircle2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface BulkMappingModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function BulkMappingModal({ isOpen, onClose, onSuccess }: BulkMappingModalProps) {
    const [loading, setLoading] = useState(false)
    const [universities, setUniversities] = useState<any[]>([])
    const [masterCourses, setMasterCourses] = useState<any[]>([])

    // Selection State
    const [selectedUniv, setSelectedUniv] = useState<string>("")
    const [selectedCourses, setSelectedCourses] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (isOpen) {
            loadData()
            setSelectedUniv("")
            setSelectedCourses([])
            setSearchQuery("")
        }
    }, [isOpen])

    const loadData = async () => {
        const supabase = createClient()
        const [{ data: univs, error: univError }, { data: courses, error: courseError }] = await Promise.all([
            supabase.from('universities').select('id, name').order('name'),
            supabase.from('master_courses').select('id, name, code, stream').eq('is_active', true).order('name')
        ])

        if (univError) console.error("Univ Load Error:", univError)
        if (courseError) console.error("Course Load Error:", courseError)

        setUniversities(univs || [])
        setMasterCourses(courses || [])
    }

    const toggleCourse = (id: string) => {
        setSelectedCourses(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const handleBulkMap = async () => {
        if (!selectedUniv || selectedCourses.length === 0) return

        setLoading(true)
        try {
            const supabase = createClient()

            // Use the RPC function we created in v18
            const { error } = await supabase.rpc('bulk_map_university_courses', {
                p_university_id: selectedUniv,
                p_master_course_ids: selectedCourses
            })

            if (error) throw error

            onSuccess()
            onClose()
            alert(`Successfully mapped ${selectedCourses.length} courses!`)
        } catch (error: any) {
            console.error("Bulk Map Error:", error)
            alert("Error mapping courses: " + (error?.message || JSON.stringify(error)))
        } finally {
            setLoading(false)
        }
    }

    const filteredCourses = masterCourses.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.stream?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Bulk Course Mapping</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* 1. Select University */}
                    <div className="space-y-2">
                        <Label className="font-bold text-base">Step 1: Select University</Label>
                        <Select value={selectedUniv} onValueChange={setSelectedUniv}>
                            <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Choose a University..." />
                            </SelectTrigger>
                            <SelectContent>
                                {universities.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 2. Select Courses */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="font-bold text-base">Step 2: Select Courses to Map ({selectedCourses.length})</Label>
                            {selectedCourses.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={() => setSelectedCourses([])}>Clear</Button>
                            )}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses by name, code or stream..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[300px] border rounded-md p-2">
                            <div className="space-y-2">
                                {filteredCourses.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">No courses found.</div>
                                ) : (
                                    filteredCourses.map(course => (
                                        <div
                                            key={course.id}
                                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${selectedCourses.includes(course.id) ? 'bg-blue-50 border-blue-200' : 'bg-card'}`}
                                            onClick={() => toggleCourse(course.id)}
                                        >
                                            <Checkbox
                                                checked={selectedCourses.includes(course.id)}
                                                onCheckedChange={() => toggleCourse(course.id)}
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold flex items-center gap-2">
                                                    {course.name}
                                                    <Badge variant="outline" className="text-[10px]">{course.stream}</Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">Code: {course.code || 'N/A'}</div>
                                            </div>
                                            {selectedCourses.includes(course.id) && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleBulkMap}
                        disabled={!selectedUniv || selectedCourses.length === 0 || loading}
                        className="bg-primary min-w-[150px]"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Map {selectedCourses.length} Courses
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
