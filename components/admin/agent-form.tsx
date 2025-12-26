"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"

interface AgentFormProps {
  onSuccess?: () => void
  consultancyId?: string
}

export function AgentForm({ onSuccess, consultancyId }: AgentFormProps) {
  const [loading, setLoading] = useState(false)
  const [consultancies, setConsultancies] = useState<{ id: string, name: string }[]>([])

  const [formData, setFormData] = useState({
    name: "",
    consultancy_id: consultancyId || "",
    contact_email: "",
    contact_phone: "",
    city: "",
    state: "",
    default_commission_percent: "10",
  })

  // Fetch consultancies for dropdown
  useEffect(() => {
    const fetchConsultancies = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('consultancies').select('id, name')
      if (data) setConsultancies(data)
    }
    fetchConsultancies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const insertData = {
        name: formData.name,
        consultancy_id: formData.consultancy_id,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        city: formData.city,
        state: formData.state,
        commission_rate: parseFloat(formData.default_commission_percent),
        status: 'active', // default status
        wallet_balance: 0.00
      }

      const { error } = await supabase
        .from('agents')
        .insert(insertData)

      if (error) throw error

      onSuccess?.()

      setFormData({
        name: "",
        consultancy_id: consultancyId || "",
        contact_email: "",
        contact_phone: "",
        city: "",
        state: "",
        default_commission_percent: "10",
      })

    } catch (error: any) {
      console.error("Failed to add agent:", error)
      alert(`Failed to add agent: ${error.message}`)
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
                  {consultancies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
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

      {/* Commission */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Commission</h3>
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
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Agent"}
      </Button>
    </form>
  )
}
