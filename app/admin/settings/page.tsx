"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Save, RotateCcw } from "lucide-react"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    app_name: "Profit Pulse EduConnect",
    support_email: "support@profitpulse.com",
    support_phone: "+91-9876543210",
    company_address: "123 Education Street, New Delhi, India",
    gst_rate: "18",
    timezone: "Asia/Kolkata",
  })

  const [commissionSettings, setCommissionSettings] = useState({
    default_agent_commission: "5",
    default_consultancy_share: "10",
    university_processing_fee: "2",
    super_admin_profit_margin: "8",
  })

  const [systemSettings, setSystemSettings] = useState({
    enable_email_notifications: true,
    enable_sms_alerts: true,
    auto_payment_reminder: true,
    maintenance_mode: false,
    backup_enabled: true,
    auto_backup_daily: true,
  })

  const [savedMessage, setSavedMessage] = useState("")

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCommissionSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSystemChange = (name: string, value: boolean) => {
    setSystemSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = (section: string) => {
    setSavedMessage(`${section} settings saved successfully!`)
    setTimeout(() => setSavedMessage(""), 3000)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Settings</h1>
        {savedMessage && <p className="text-green-600 font-medium">{savedMessage}</p>}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">General Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="app_name">Application Name</Label>
                <Input id="app_name" name="app_name" value={generalSettings.app_name} onChange={handleGeneralChange} />
              </div>

              <div>
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  name="support_email"
                  type="email"
                  value={generalSettings.support_email}
                  onChange={handleGeneralChange}
                />
              </div>

              <div>
                <Label htmlFor="support_phone">Support Phone</Label>
                <Input
                  id="support_phone"
                  name="support_phone"
                  value={generalSettings.support_phone}
                  onChange={handleGeneralChange}
                />
              </div>

              <div>
                <Label htmlFor="company_address">Company Address</Label>
                <Textarea
                  id="company_address"
                  name="company_address"
                  value={generalSettings.company_address}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gst_rate">GST Rate (%)</Label>
                  <Input
                    id="gst_rate"
                    name="gst_rate"
                    type="number"
                    value={generalSettings.gst_rate}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={generalSettings.timezone}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave("General")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline" className="bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Commission Settings */}
        <TabsContent value="commission" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Commission & Fee Configuration</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-6">
                <p className="text-sm text-blue-900">
                  Configure default commission percentages and fee structures for the system. These values can be
                  overridden at the course level.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent_commission">Agent Commission (%)</Label>
                  <Input
                    id="agent_commission"
                    name="default_agent_commission"
                    type="number"
                    step="0.1"
                    value={commissionSettings.default_agent_commission}
                    onChange={handleCommissionChange}
                  />
                </div>

                <div>
                  <Label htmlFor="consultancy_share">Consultancy Share (%)</Label>
                  <Input
                    id="consultancy_share"
                    name="default_consultancy_share"
                    type="number"
                    step="0.1"
                    value={commissionSettings.default_consultancy_share}
                    onChange={handleCommissionChange}
                  />
                </div>

                <div>
                  <Label htmlFor="university_fee">University Processing Fee (%)</Label>
                  <Input
                    id="university_fee"
                    name="university_processing_fee"
                    type="number"
                    step="0.1"
                    value={commissionSettings.university_processing_fee}
                    onChange={handleCommissionChange}
                  />
                </div>

                <div>
                  <Label htmlFor="profit_margin">Super Admin Profit Margin (%)</Label>
                  <Input
                    id="profit_margin"
                    name="super_admin_profit_margin"
                    type="number"
                    step="0.1"
                    value={commissionSettings.super_admin_profit_margin}
                    onChange={handleCommissionChange}
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="font-semibold text-green-900 mb-2">Total Distribution</p>
                <p className="text-sm text-green-800">
                  {`${(Number.parseFloat(commissionSettings.default_agent_commission) + Number.parseFloat(commissionSettings.default_consultancy_share) + Number.parseFloat(commissionSettings.university_processing_fee) + Number.parseFloat(commissionSettings.super_admin_profit_margin)).toFixed(1)}%`}
                  {" of fees are distributed"}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave("Commission")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">System Configuration</h3>
            <div className="space-y-4">
              {[
                { key: "enable_email_notifications", label: "Enable Email Notifications" },
                { key: "enable_sms_alerts", label: "Enable SMS Alerts" },
                { key: "auto_payment_reminder", label: "Auto Payment Reminders" },
                { key: "maintenance_mode", label: "Maintenance Mode" },
                { key: "backup_enabled", label: "Enable Backup" },
                { key: "auto_backup_daily", label: "Daily Auto Backup" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border border-border rounded">
                  <Label>{item.label}</Label>
                  <Switch
                    checked={systemSettings[item.key as keyof typeof systemSettings]}
                    onCheckedChange={(value) => handleSystemChange(item.key, value)}
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleSave("System")}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Third-party Integrations</h3>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded flex items-center justify-between">
                <div>
                  <p className="font-semibold">Email Service (SMTP)</p>
                  <p className="text-sm text-muted-foreground">Configure email settings for notifications</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="p-4 border border-border rounded flex items-center justify-between">
                <div>
                  <p className="font-semibold">SMS Gateway</p>
                  <p className="text-sm text-muted-foreground">Setup SMS alerts and OTP service</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="p-4 border border-border rounded flex items-center justify-between">
                <div>
                  <p className="font-semibold">Payment Gateway</p>
                  <p className="text-sm text-muted-foreground">Connect Razorpay or Stripe for payments</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="p-4 border border-border rounded flex items-center justify-between">
                <div>
                  <p className="font-semibold">Cloud Storage</p>
                  <p className="text-sm text-muted-foreground">Setup AWS S3 or Google Cloud Storage</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
