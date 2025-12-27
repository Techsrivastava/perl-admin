"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase"


interface ConsultancyFormProps {
  onSuccess?: () => void
  editData?: any // Added for edit mode
}

export function ConsultancyForm({ onSuccess, editData }: ConsultancyFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: editData?.name || "",
    owner_name: editData?.owner_name || "",
    registration_number: editData?.registration_no || "",
    contact_email: editData?.contact_email || "",
    contact_phone: editData?.contact_phone || "",
    address: editData?.address?.split(', ')[0] || "",
    city: editData?.address?.split(', ')[1] || "",
    state: editData?.address?.split(', ')[2] || "",
    country: "", // Assuming country isn't stored in simple string or default
    // Bank Details (using optional chaining safely)
    bank_name: editData?.bank_details?.bank_name || "",
    bank_account_number: editData?.bank_details?.account_number || "",
    bank_ifsc: editData?.bank_details?.ifsc_code || "",
    bank_branch: editData?.bank_details?.branch || "",
    account_holder_name: editData?.bank_details?.holder_name || "",
    // GST & Legal
    gst_number: editData?.bank_details?.gst_number || "",
    pan_number: editData?.bank_details?.pan_number || "",
    password: "", // Password usually reset on edit or left blank to keep existing
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const payload = {
        name: formData.name,
        owner_name: formData.owner_name,
        registration_no: formData.registration_number,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        address: `${formData.address}, ${formData.city}, ${formData.state}`,
        status: editData?.status || 'approved',
        bank_details: {
          bank_name: formData.bank_name,
          account_number: formData.bank_account_number,
          ifsc_code: formData.bank_ifsc,
          branch: formData.bank_branch,
          holder_name: formData.account_holder_name,
          gst_number: formData.gst_number,
          pan_number: formData.pan_number
        },
        // Only update password if provided
        ...(formData.password ? { password_hash: formData.password } : {})
      }

      if (editData?.id) {
        // Update
        const { error } = await supabase
          .from('consultancies')
          .update(payload)
          .eq('id', editData.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase
          .from('consultancies')
          .insert({
            ...payload,
            wallet_balance: 0.00,
            password_hash: formData.password // Required for new
          })
        if (error) throw error
      }

      onSuccess?.()

      if (!editData) {
        setFormData({
          name: "",
          owner_name: "",
          registration_number: "",
          contact_email: "",
          contact_phone: "",
          address: "",
          city: "",
          state: "",
          country: "",
          bank_name: "",
          bank_account_number: "",
          bank_ifsc: "",
          bank_branch: "",
          account_holder_name: "",
          gst_number: "",
          pan_number: "",
          password: "",
        })
      }
    } catch (error: any) {
      console.error("Failed to save consultancy:", error)
      alert(`Failed to save consultancy: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Consultancy Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Global Education Consultants"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="owner_name">Owner Name *</Label>
            <Input
              id="owner_name"
              placeholder="Full name"
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="registration_number">Registration Number *</Label>
            <Input
              id="registration_number"
              placeholder="e.g., REG-2024-001"
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_email">Email *</Label>
            <Input
              id="contact_email"
              type="email"
              placeholder="email@consultancy.com"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_phone">Phone *</Label>
            <Input
              id="contact_phone"
              placeholder="+91-9876543210"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Login Password *</Label>
            <Input
              id="password"
              placeholder="Set admin password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City name"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="State name"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Country name"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Full address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      {/* Bank Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bank Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              placeholder="e.g., HDFC Bank"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="bank_branch">Branch Name</Label>
            <Input
              id="bank_branch"
              placeholder="Branch location"
              value={formData.bank_branch}
              onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="account_holder_name">Account Holder Name</Label>
            <Input
              id="account_holder_name"
              placeholder="As per bank records"
              value={formData.account_holder_name}
              onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="bank_account_number">Account Number</Label>
            <Input
              id="bank_account_number"
              placeholder="Account number"
              value={formData.bank_account_number}
              onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="bank_ifsc">IFSC Code</Label>
            <Input
              id="bank_ifsc"
              placeholder="e.g., HDFC0001234"
              value={formData.bank_ifsc}
              onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })}
              maxLength={11}
            />
          </div>
        </div>
      </div>

      {/* GST & Tax Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">GST & Tax Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gst_number">GST Number (Optional)</Label>
            <Input
              id="gst_number"
              placeholder="e.g., 22AAAAA0000A1Z5"
              value={formData.gst_number}
              onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
              maxLength={15}
            />
          </div>

          <div>
            <Label htmlFor="pan_number">PAN Number</Label>
            <Input
              id="pan_number"
              placeholder="e.g., ABCDE1234F"
              value={formData.pan_number}
              onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
              maxLength={10}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (editData ? "Updating..." : "Creating...") : (editData ? "Update Consultancy" : "Create Consultancy")}
      </Button>
    </form>
  )
}

