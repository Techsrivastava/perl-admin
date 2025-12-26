"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Save, RotateCcw, Settings, Globe, Percent, Bell, ShieldAlert, Cpu, Database, DatabaseZap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    app_name: "Perl Admin Portal",
    support_email: "support@perl-edu.com",
    support_phone: "+91 98877 66554",
    company_address: "Sector 62, Noida, UP, India",
    gst_rate: "18",
    currency: "INR (₹)",
  })

  const [commissionSettings, setCommissionSettings] = useState({
    default_agent_commission: "10",
    default_consultancy_share: "20",
    system_markup: "5",
  })

  const [loading, setLoading] = useState(true)
  const [savedMessage, setSavedMessage] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('app_settings').select('*')
      if (error) throw error

      if (data) {
        const general = data.find(s => s.id === 'general')?.data
        const commission = data.find(s => s.id === 'commission')?.data
        if (general) setGeneralSettings(general)
        if (commission) setCommissionSettings(commission)
      }
    } catch (err: any) {
      console.error("Error loading settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: string) => {
    try {
      const settingsId = section.toLowerCase() === 'general' ? 'general' : 'commission'
      const settingsData = section.toLowerCase() === 'general' ? generalSettings : commissionSettings

      const { error } = await supabase
        .from('app_settings')
        .upsert({ id: settingsId, data: settingsData })

      if (error) throw error

      setSavedMessage(`${section} Preferences updated!`)
      setTimeout(() => setSavedMessage(""), 3000)
    } catch (err: any) {
      alert("Failed to save: " + err.message)
    }
  }

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center opacity-50">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <p className="font-bold text-lg animate-pulse">Loading configurations...</p>
    </div>
  )

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            System Configuration
          </h1>
          <p className="text-muted-foreground mt-1">Global environment variables and business logic parameters</p>
        </div>
        {savedMessage && (
          <Badge className="bg-green-500 text-white animate-bounce px-4 py-1.5 rounded-full border-none">
            {savedMessage}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex w-fit bg-muted p-1 rounded-xl h-12 mb-8">
          <TabsTrigger value="general" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Globe className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="commission" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Percent className="w-4 h-4 mr-2" /> Billing
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Cpu className="w-4 h-4 mr-2" /> Engine
          </TabsTrigger>
          <TabsTrigger value="infra" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <DatabaseZap className="w-4 h-4 mr-2" /> Infrastructure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="animate-in fade-in-50 zoom-in-95 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8 border-none shadow-md space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Identity Name</Label>
                  <Input
                    value={generalSettings.app_name}
                    className="h-11 bg-muted/20 border-muted"
                    onChange={(e) => setGeneralSettings({ ...generalSettings, app_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">System Currency</Label>
                  <Input
                    value={generalSettings.currency}
                    className="h-11 bg-muted/20 border-muted"
                    onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Compliance Email</Label>
                  <Input
                    value={generalSettings.support_email}
                    className="h-11 bg-muted/20 border-muted"
                    onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Tax Percentage (GST)</Label>
                  <Input
                    type="number"
                    value={generalSettings.gst_rate}
                    className="h-11 bg-muted/20 border-muted"
                    onChange={(e) => setGeneralSettings({ ...generalSettings, gst_rate: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="font-bold">Headquarters Address</Label>
                  <Textarea
                    value={generalSettings.company_address}
                    className="bg-muted/20 border-muted"
                    rows={3}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, company_address: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" className="font-bold">Discard</Button>
                <Button className="font-black px-10 shadow-lg shadow-primary/20" onClick={() => handleSave('General')}>Save Changes</Button>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 border-none shadow-md bg-slate-900 text-white">
                <Globe className="w-10 h-10 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Localization</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  System is currently configured for India operations. All financial logs are generated in IST (UTC+5:30).
                </p>
              </Card>
              <Card className="p-6 border-none shadow-md bg-white">
                <ShieldAlert className="w-10 h-10 text-amber-500 mb-4" />
                <h4 className="font-bold text-lg mb-2">Account Privacy</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Changes to Headquarters address may require re-verification of business documents.
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commission" className="animate-in fade-in-50 zoom-in-95 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 border-none shadow-md space-y-8">
              <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                <Percent className="w-6 h-6 text-primary" />
                Default Settlement Rules
              </h3>

              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-black text-sm">Base Agent Commission (%)</Label>
                    <p className="text-xs text-muted-foreground italic">Applied when course-level rate is null</p>
                  </div>
                  <Input
                    className="w-24 text-center font-black h-11 border-primary/20"
                    value={commissionSettings.default_agent_commission}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, default_agent_commission: e.target.value })}
                  />
                </div>

                <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-black text-sm">Consultancy Protocol Share (%)</Label>
                    <p className="text-xs text-muted-foreground italic">Partner consultancy retention rate</p>
                  </div>
                  <Input
                    className="w-24 text-center font-black h-11 border-primary/20"
                    value={commissionSettings.default_consultancy_share}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, default_consultancy_share: e.target.value })}
                  />
                </div>

                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-black text-sm text-primary">System Infrastructure Fee (%)</Label>
                    <p className="text-xs text-primary/60 italic">Platform usage and maintenance markup</p>
                  </div>
                  <Input
                    className="w-24 text-center font-black h-11 bg-white border-primary/20"
                    value={commissionSettings.system_markup}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, system_markup: e.target.value })}
                  />
                </div>
              </div>

              <Button className="w-full h-14 font-black text-lg bg-slate-900 shadow-xl" onClick={() => handleSave('Billing')}>Update Revenue Logic</Button>
            </Card>

            <Card className="p-8 border-none bg-slate-50 shadow-inner">
              <h4 className="font-bold mb-4">Payout Schedule</h4>
              <div className="space-y-4">
                {[
                  { day: 'Monday', action: 'Ledger Reconciliation' },
                  { day: 'Wednesday', action: 'University Payouts' },
                  { day: 'Friday', action: 'Agent Settlements' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-xs font-black">{item.day.slice(0, 3)}</div>
                    <p className="text-sm font-medium">{item.action}</p>
                  </div>
                ))}
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Automated Rules</p>
                  <ul className="text-xs space-y-2 text-slate-500 font-medium">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full" /> Auto-approve payouts under ₹50,000</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full" /> Flag transactions with deviation &gt; 2%</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="animate-in fade-in-50 zoom-in-95 duration-300">
          <Card className="p-8 border-none shadow-md">
            <div className="space-y-6">
              {[
                { label: 'Cloud Notification Sync', desc: 'Sync FCM tokens with Supabase Edge Functions', active: true },
                { label: 'Real-time Ledger Observation', desc: 'Listen to DB changes for instant wallet updates', active: true },
                { label: 'Deep Packet Inspection', desc: 'Verify document integrity using AI check', active: false },
                { label: 'Maintenance Protocol', desc: 'Switch portal to read-only mode for updates', active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-muted rounded-2xl hover:bg-muted/10 transition-colors">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.active} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
