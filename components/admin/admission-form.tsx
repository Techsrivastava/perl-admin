"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdmissionFormProps {
  onSuccess?: () => void
}

export function AdmissionForm({ onSuccess }: AdmissionFormProps) {
  const [formData, setFormData] = useState({
    student_name: "",
    student_email: "",
    student_phone: "",
    university_id: "",
    course_id: "",
    consultancy_id: "",
    agent_id: "",
    total_fee: "",
  })

  // Data states
  const [universities, setUniversities] = useState<any[]>([])
  const [consultancies, setConsultancies] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadUniversities()
    loadConsultancies()
  }, [])

  useEffect(() => {
    if (formData.university_id) {
      loadCourses(formData.university_id)
    } else {
      setCourses([])
    }
  }, [formData.university_id])

  useEffect(() => {
    if (formData.consultancy_id) {
      loadAgents(formData.consultancy_id)
    } else {
      setAgents([])
    }
  }, [formData.consultancy_id])

  useEffect(() => {
    if (formData.course_id) {
      const course = courses.find(c => c.id === formData.course_id)
      if (course) {
        setFormData(prev => ({ ...prev, total_fee: course.display_fee }))
      }
    }
  }, [formData.course_id, courses])

  const loadUniversities = async () => {
    const { data } = await supabase.from('universities').select('id, name')
    if (data) setUniversities(data)
  }

  const loadConsultancies = async () => {
    const { data } = await supabase.from('consultancies').select('id, name')
    if (data) setConsultancies(data)
  }

  const loadCourses = async (uniId: string) => {
    const { data } = await supabase
      .from('university_courses')
      .select(`
            id, 
            display_fee,
            master_courses ( name )
        `)
      .eq('university_id', uniId)

    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.master_courses?.name,
        display_fee: item.display_fee
      }))
      setCourses(formatted)
    }
  }

  const loadAgents = async (consultancyId: string) => {
    const { data } = await supabase
      .from('agents')
      .select('id, first_name, last_name')
      .eq('consultancy_id', consultancyId)

    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        name: `${item.first_name} ${item.last_name}`
      }))
      setAgents(formatted)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('admissions').insert({
        student_name: formData.student_name,
        student_email: formData.student_email,
        student_phone: formData.student_phone,
        university_id: formData.university_id,
        course_id: formData.course_id,
        consultancy_id: formData.consultancy_id,
        agent_id: formData.agent_id || null,
        total_fee: parseFloat(formData.total_fee) || 0,
        pending_fee: parseFloat(formData.total_fee) || 0, // Initially pending is total
        status: 'pending'
      })

      if (error) throw error

      onSuccess?.()
      setFormData({
        student_name: "",
        student_email: "",
        student_phone: "",
        university_id: "",
        course_id: "",
        consultancy_id: "",
        agent_id: "",
        total_fee: "",
      })
    } catch (error: any) {
      console.error("Failed to add admission:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="student_name">Student Name *</Label>
          <Input
            id="student_name"
            placeholder="Full name"
            value={formData.student_name}
            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="student_email">Student Email *</Label>
          <Input
            id="student_email"
            type="email"
            placeholder="student@email.com"
            value={formData.student_email}
            onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="student_phone">Student Phone *</Label>
          <Input
            id="student_phone"
            placeholder="+91-9876543210"
            value={formData.student_phone}
            onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="university">University *</Label>
          <Select value={formData.university_id} onValueChange={(val) => setFormData({ ...formData, university_id: val, course_id: "" })}>
            <SelectTrigger>
              <SelectValue placeholder="Select university..." />
            </SelectTrigger>
            <SelectContent>
              {universities.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="course">Course *</Label>
          <Select value={formData.course_id} onValueChange={(val) => setFormData({ ...formData, course_id: val })} disabled={!formData.university_id}>
            <SelectTrigger>
              <SelectValue placeholder="Select course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="consultancy">Consultancy *</Label>
          <Select value={formData.consultancy_id} onValueChange={(val) => setFormData({ ...formData, consultancy_id: val, agent_id: "" })}>
            <SelectTrigger>
              <SelectValue placeholder="Select consultancy..." />
            </SelectTrigger>
            <SelectContent>
              {consultancies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="agent">Agent</Label>
          <Select value={formData.agent_id} onValueChange={(val) => setFormData({ ...formData, agent_id: val })} disabled={!formData.consultancy_id}>
            <SelectTrigger>
              <SelectValue placeholder="Select agent..." />
            </SelectTrigger>
            <SelectContent>
              {agents.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="total_fee">Total Fee (₹) *</Label>
          <Input
            id="total_fee"
            type="number"
            placeholder="500000"
            value={formData.total_fee}
            onChange={(e) => setFormData({ ...formData, total_fee: e.target.value })}
            required
            readOnly
            className="bg-muted"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding..." : "Add Admission"}
      </Button>
    </form>
  )
}
