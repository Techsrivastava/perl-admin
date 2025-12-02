"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UniversityFormProps {
  onSuccess: () => void
}

export function UniversityForm({ onSuccess }: UniversityFormProps) {
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    short_name: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    address: "",
    established_year: "",
    // Legal
    registration_type: "",
    registration_no: "",
    registration_certificate: null as File | null,
    // Authorized Person
    auth_person_name: "",
    auth_person_father_name: "",
    auth_person_email: "",
    auth_person_mobile: "",
    auth_person_designation: "",
    auth_person_id_proof: null as File | null,
    auth_person_authorization_letter: null as File | null,
    // Login
    username: "",
    password: "",
    confirm_password: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, [fieldName]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        // Reset form
        setFormData({
          name: "",
          short_name: "",
          email: "",
          phone: "",
          state: "",
          city: "",
          address: "",
          established_year: "",
          registration_type: "",
          registration_no: "",
          registration_certificate: null,
          auth_person_name: "",
          auth_person_father_name: "",
          auth_person_email: "",
          auth_person_mobile: "",
          auth_person_designation: "",
          auth_person_id_proof: null,
          auth_person_authorization_letter: null,
          username: "",
          password: "",
          confirm_password: "",
        })
      }
    } catch (error) {
      console.error("Failed to create university:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* SECTION: Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">University Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Delhi University"
            />
          </div>

          <div>
            <Label htmlFor="short_name">Short Name</Label>
            <Input
              id="short_name"
              name="short_name"
              value={formData.short_name}
              onChange={handleChange}
              placeholder="e.g., DU"
            />
          </div>

          <div>
            <Label htmlFor="established_year">Established Year *</Label>
            <Input
              id="established_year"
              name="established_year"
              type="number"
              value={formData.established_year}
              onChange={handleChange}
              required
              placeholder="e.g., 1922"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="contact@university.edu"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+91 9876543210"
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder="State"
            />
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input id="city" name="city" value={formData.city} onChange={handleChange} required placeholder="City" />
          </div>

          <div className="col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Full address"
              rows={2}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* SECTION: Legal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Legal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="registration_type">Registration Type *</Label>
            <Select value={formData.registration_type} onValueChange={(value) => setFormData({ ...formData, registration_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="autonomous">Autonomous</SelectItem>
                <SelectItem value="deemed">Deemed University</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="registration_no">Registration Number *</Label>
            <Input
              id="registration_no"
              name="registration_no"
              value={formData.registration_no}
              onChange={handleChange}
              required
              placeholder="REG-XXXX-YYYY"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="registration_certificate">Upload Registration Certificate * (Max 5MB)</Label>
            <Input
              id="registration_certificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, "registration_certificate")}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* SECTION: Authorized Person */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Authorized Person Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="auth_person_name">Name *</Label>
            <Input
              id="auth_person_name"
              name="auth_person_name"
              value={formData.auth_person_name}
              onChange={handleChange}
              required
              placeholder="Full name"
            />
          </div>

          <div>
            <Label htmlFor="auth_person_father_name">Father's Name</Label>
            <Input
              id="auth_person_father_name"
              name="auth_person_father_name"
              value={formData.auth_person_father_name}
              onChange={handleChange}
              placeholder="Father's name"
            />
          </div>

          <div>
            <Label htmlFor="auth_person_email">Email *</Label>
            <Input
              id="auth_person_email"
              name="auth_person_email"
              type="email"
              value={formData.auth_person_email}
              onChange={handleChange}
              required
              placeholder="person@university.edu"
            />
          </div>

          <div>
            <Label htmlFor="auth_person_mobile">Mobile *</Label>
            <Input
              id="auth_person_mobile"
              name="auth_person_mobile"
              value={formData.auth_person_mobile}
              onChange={handleChange}
              required
              placeholder="9876543210"
              maxLength={10}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="auth_person_designation">Designation *</Label>
            <Input
              id="auth_person_designation"
              name="auth_person_designation"
              value={formData.auth_person_designation}
              onChange={handleChange}
              required
              placeholder="e.g., Dean / Registrar"
            />
          </div>

          <div>
            <Label htmlFor="auth_person_id_proof">Upload ID Proof * (Max 5MB)</Label>
            <Input
              id="auth_person_id_proof"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, "auth_person_id_proof")}
              required
            />
          </div>

          <div>
            <Label htmlFor="auth_person_authorization_letter">Upload Authorization Letter * (Max 5MB)</Label>
            <Input
              id="auth_person_authorization_letter"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, "auth_person_authorization_letter")}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* SECTION: Login Credentials */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Login Credentials</h3>
        <p className="text-sm text-muted-foreground">OTP will be enabled by default for university login</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Unique username"
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min 8 characters"
              minLength={8}
            />
          </div>

          <div>
            <Label htmlFor="confirm_password">Confirm Password *</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              placeholder="Re-enter password"
              minLength={8}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating University..." : "Create University"}
      </Button>
    </form>
  )
}
