"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AgentFormProps {
  onSuccess?: () => void
  consultancyId?: string
}

export function AgentForm({ onSuccess, consultancyId }: AgentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    consultancy_id: consultancyId || "",
    contact_email: "",
    contact_phone: "",
    city: "",
    state: "",
    username: "",
    password: "",
    default_commission_percent: "10",
    assigned_courses: [] as string[],
  })

  const [permissions, setPermissions] = useState({
    can_submit_fee: true,
    can_view_commission: true,
    can_download_slips: true,
    can_edit_profile_basic: true,
    can_view_students: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        onSuccess?.()
        setFormData({
          name: "",
          consultancy_id: consultancyId || "",
          contact_email: "",
          contact_phone: "",
          city: "",
          state: "",
          username: "",
          password: "",
          default_commission_percent: "10",
          assigned_courses: [],
        })
        setPermissions({
          can_submit_fee: true,
          can_view_commission: true,
          can_download_slips: true,
          can_edit_profile_basic: true,
          can_view_students: true,
        })
      }
    } catch (error) {
      console.error("Failed to add agent:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Agent Name *</Label>
            <Input
              id="name"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {!consultancyId && (
            <div className="col-span-2">
              <Label htmlFor="consultancy">Consultancy *</Label>
              <Select value={formData.consultancy_id} onValueChange={(value) => setFormData({ ...formData, consultancy_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consultancy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Global Education Consultants</SelectItem>
                  <SelectItem value="2">Future Path Consultancy</SelectItem>
                  <SelectItem value="3">Success Study Abroad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="agent@email.com"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              placeholder="9876543210"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              required
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              placeholder="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Login Credentials */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Login Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="Unique username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Commission & Courses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Commission & Courses</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="commission">Default Commission % *</Label>
            <Input
              id="commission"
              type="number"
              min="0"
              max="100"
              step="0.5"
              placeholder="e.g., 10"
              value={formData.default_commission_percent}
              onChange={(e) => setFormData({ ...formData, default_commission_percent: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">This will be applied to all admissions by this agent</p>
          </div>

          <div>
            <Label htmlFor="courses">Assigned Courses (Optional)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select courses to assign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">B.Tech Computer Science</SelectItem>
                <SelectItem value="2">M.Tech AI & ML</SelectItem>
                <SelectItem value="3">BCA - Computer Applications</SelectItem>
                <SelectItem value="4">MBA - General</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Agent will only be able to process admissions for assigned courses</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Permissions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Agent Permissions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="perm-submit-fee">Can Submit Fee</Label>
            <Switch
              id="perm-submit-fee"
              checked={permissions.can_submit_fee}
              onCheckedChange={(checked) => setPermissions({ ...permissions, can_submit_fee: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="perm-view-commission">Can View Commission</Label>
            <Switch
              id="perm-view-commission"
              checked={permissions.can_view_commission}
              onCheckedChange={(checked) => setPermissions({ ...permissions, can_view_commission: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="perm-download-slips">Can Download Fee Slips</Label>
            <Switch
              id="perm-download-slips"
              checked={permissions.can_download_slips}
              onCheckedChange={(checked) => setPermissions({ ...permissions, can_download_slips: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="perm-edit-profile">Can Edit Profile (Basic)</Label>
            <Switch
              id="perm-edit-profile"
              checked={permissions.can_edit_profile_basic}
              onCheckedChange={(checked) => setPermissions({ ...permissions, can_edit_profile_basic: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="perm-view-students">Can View All Students</Label>
            <Switch
              id="perm-view-students"
              checked={permissions.can_view_students}
              onCheckedChange={(checked) => setPermissions({ ...permissions, can_view_students: checked })}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create Agent
      </Button>
    </form>
  )
}
