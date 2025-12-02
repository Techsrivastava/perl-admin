"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
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
      }
    } catch (error) {
      console.error("Failed to add admission:", error)
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
          <select
            id="university"
            value={formData.university_id}
            onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            required
          >
            <option value="">Select university...</option>
            <option value="1">Delhi University</option>
            <option value="2">Mumbai University</option>
            <option value="3">Bangalore Institute</option>
          </select>
        </div>

        <div>
          <Label htmlFor="course">Course *</Label>
          <select
            id="course"
            value={formData.course_id}
            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            required
          >
            <option value="">Select course...</option>
            <option value="1">B.Tech Computer Science</option>
            <option value="2">M.Tech AI & Machine Learning</option>
            <option value="3">BCA - Computer Applications</option>
          </select>
        </div>

        <div>
          <Label htmlFor="consultancy">Consultancy *</Label>
          <select
            id="consultancy"
            value={formData.consultancy_id}
            onChange={(e) => setFormData({ ...formData, consultancy_id: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            required
          >
            <option value="">Select consultancy...</option>
            <option value="1">Global Education</option>
            <option value="2">Future Path</option>
          </select>
        </div>

        <div>
          <Label htmlFor="agent">Agent *</Label>
          <select
            id="agent"
            value={formData.agent_id}
            onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            required
          >
            <option value="">Select agent...</option>
            <option value="1">Rajesh Kumar</option>
            <option value="2">Priya Singh</option>
            <option value="3">Amit Verma</option>
          </select>
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
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add Admission
      </Button>
    </form>
  )
}
