"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface MapCourseUniversityModalProps {
  onSuccess?: () => void
}

export function MapCourseUniversityModal({ onSuccess }: MapCourseUniversityModalProps) {
  const [formData, setFormData] = useState({
    university_id: "",
    course_id: "",
    university_fee: "",
    student_display_fee: "",
    consultancy_share_type: "percent",
    consultancy_share_value: "",
    total_seats: "",
    available_seats: "",
    auto_split_fee: true,
  })

  const [oneTimeFees, setOneTimeFees] = useState([
    { id: "degree_fee", name: "Degree Fee", amount: "5000", mandatory: true, selected: true },
    { id: "migration_fee", name: "Migration Fee", amount: "2000", mandatory: false, selected: false },
    { id: "sports_fee", name: "Sports Fee", amount: "1500", mandatory: false, selected: true },
    { id: "convocation_fee", name: "Convocation Fee", amount: "3000", mandatory: false, selected: false },
    { id: "alumni_fee", name: "Alumni Registration Fee", amount: "1000", mandatory: false, selected: false },
  ])

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedFees = oneTimeFees.filter(f => f.selected)
      const response = await fetch("/api/university-courses/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, one_time_fees: selectedFees }),
      })

      if (response.ok) {
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to map course:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFee = (id: string) => {
    setOneTimeFees(oneTimeFees.map(fee =>
      fee.id === id ? { ...fee, selected: !fee.selected } : fee
    ))
  }

  const toggleMandatory = (id: string) => {
    setOneTimeFees(oneTimeFees.map(fee =>
      fee.id === id ? { ...fee, mandatory: !fee.mandatory } : fee
    ))
  }

  const updateFeeAmount = (id: string, amount: string) => {
    setOneTimeFees(oneTimeFees.map(fee =>
      fee.id === id ? { ...fee, amount } : fee
    ))
  }

  const calculatedProfit = formData.student_display_fee && formData.university_fee
    ? Number(formData.student_display_fee) - Number(formData.university_fee)
    : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      <div>
        <h3 className="text-lg font-semibold mb-2">Map Course to University</h3>
        <p className="text-sm text-muted-foreground">Attach a master course to a university with fee structure and seat allocation</p>
      </div>

      {/* University & Course Selection */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="university">Select University *</Label>
          <Select value={formData.university_id} onValueChange={(value) => setFormData({ ...formData, university_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Delhi University</SelectItem>
              <SelectItem value="2">Mumbai University</SelectItem>
              <SelectItem value="3">Bangalore Institute of Technology</SelectItem>
              <SelectItem value="4">Chennai Medical College</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="course">Map Master Course *</Label>
          <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">B.Tech Computer Science</SelectItem>
              <SelectItem value="2">M.Tech AI & Machine Learning</SelectItem>
              <SelectItem value="3">BCA - Computer Applications</SelectItem>
              <SelectItem value="4">MBA - General Management</SelectItem>
              <SelectItem value="5">B.Sc Nursing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Fee Structure */}
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Fee Structure</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="university_fee">University Fee (₹) *</Label>
            <Input
              id="university_fee"
              type="number"
              value={formData.university_fee}
              onChange={(e) => setFormData({ ...formData, university_fee: e.target.value })}
              placeholder="e.g., 400000"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Fixed amount payable to university</p>
          </div>

          <div>
            <Label htmlFor="student_display_fee">Student Display Fee (₹) *</Label>
            <Input
              id="student_display_fee"
              type="number"
              value={formData.student_display_fee}
              onChange={(e) => setFormData({ ...formData, student_display_fee: e.target.value })}
              placeholder="e.g., 500000"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Fee shown to students</p>
          </div>

          <div>
            <Label htmlFor="share_type">Consultancy Share Type</Label>
            <Select value={formData.consultancy_share_type} onValueChange={(value) => setFormData({ ...formData, consultancy_share_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent</SelectItem>
                <SelectItem value="flat">Flat Amount</SelectItem>
                <SelectItem value="onetime">One-time</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="share_value">
              {formData.consultancy_share_type === "percent" ? "Share Percentage" : "Share Amount"}
            </Label>
            <Input
              id="share_value"
              type="number"
              value={formData.consultancy_share_value}
              onChange={(e) => setFormData({ ...formData, consultancy_share_value: e.target.value })}
              placeholder={formData.consultancy_share_type === "percent" ? "e.g., 10" : "e.g., 50000"}
            />
          </div>

          {calculatedProfit > 0 && (
            <div className="col-span-2 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm font-semibold text-green-900">
                Calculated Profit: ₹{calculatedProfit.toLocaleString()}
              </p>
              <p className="text-xs text-green-700">Display Fee - University Fee</p>
            </div>
          )}
        </div>
      </Card>

      <Separator />

      {/* Seats Allocation */}
      <div className="space-y-4">
        <h4 className="font-semibold">Seats Allocation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="total_seats">Total Seats</Label>
            <Input
              id="total_seats"
              type="number"
              value={formData.total_seats}
              onChange={(e) => setFormData({ ...formData, total_seats: e.target.value, available_seats: e.target.value })}
              placeholder="e.g., 120"
            />
          </div>

          <div>
            <Label htmlFor="available_seats">Available Seats</Label>
            <Input
              id="available_seats"
              type="number"
              value={formData.available_seats}
              onChange={(e) => setFormData({ ...formData, available_seats: e.target.value })}
              placeholder="e.g., 120"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* One-time Fees */}
      <div className="space-y-4">
        <h4 className="font-semibold">One-time Fees Selection</h4>
        <p className="text-sm text-muted-foreground">Select applicable one-time fees and mark as mandatory/optional</p>
        
        <div className="space-y-3">
          {oneTimeFees.map((fee) => (
            <Card key={fee.id} className="p-3">
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-1">
                  <Checkbox
                    checked={fee.selected}
                    onCheckedChange={() => toggleFee(fee.id)}
                  />
                </div>
                <div className="col-span-4">
                  <Label className="font-normal">{fee.name}</Label>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={fee.amount}
                    onChange={(e) => updateFeeAmount(fee.id, e.target.value)}
                    placeholder="Amount"
                    disabled={!fee.selected}
                    className="h-8"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <Switch
                    checked={fee.mandatory}
                    onCheckedChange={() => toggleMandatory(fee.id)}
                    disabled={!fee.selected}
                  />
                  <Label className="text-xs">{fee.mandatory ? "Mandatory" : "Optional"}</Label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Auto-split Fee */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto_split">Auto-split Fee by Year/Semester</Label>
            <p className="text-xs text-muted-foreground">System will automatically distribute fee across duration</p>
          </div>
          <Switch
            id="auto_split"
            checked={formData.auto_split_fee}
            onCheckedChange={(checked) => setFormData({ ...formData, auto_split_fee: checked })}
          />
        </div>
      </Card>

      {/* Footer */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Mapping..." : "Map Course"}
        </Button>
      </div>
    </form>
  )
}
