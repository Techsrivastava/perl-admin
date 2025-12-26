"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"

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
    // Authorized Person
    auth_person_name: "",
    auth_person_email: "",
    auth_person_mobile: "",
    auth_person_designation: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const insertData = {
        name: formData.name,
        abbreviation: formData.short_name.toUpperCase(),
        established_year: parseInt(formData.established_year) || null,
        type: formData.registration_type,
        registration_no: formData.registration_no,
        authorized_person: formData.auth_person_name, // Mapping to schema column
        contact_email: formData.email,
        contact_phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state}`, // Composite address
        city: formData.city,
        state: formData.state,
        status: 'approved', // Auto-approve for SuperAdmin creation
        // Additional mappings if needed
        wallet_balance: 0.00
      }

      const { error } = await supabase
        .from('universities')
        .insert(insertData)

      if (error) throw error

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
        auth_person_name: "",
        auth_person_email: "",
        auth_person_mobile: "",
        auth_person_designation: "",
      })

    } catch (error: any) {
      console.error('Failed to create university:', error)
      alert(`Failed to create university: ${error.message}`)
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
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="Autonomous">Autonomous</SelectItem>
                <SelectItem value="Deemed">Deemed University</SelectItem>
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

          <div>
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
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating University..." : "Create University"}
      </Button>
    </form>
  )
}
