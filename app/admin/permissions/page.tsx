"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, UserCog, Lock, Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

export default function PermissionsPage() {
  const [loading, setLoading] = useState(true)
  const [universities, setUniversities] = useState<any[]>([])
  const [consultancies, setConsultancies] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    try {
      setLoading(true)
      const { data: uni } = await supabase.from('universities').select('id, name, status, permissions')
      const { data: cons } = await supabase.from('consultancies').select('id, name, status, permissions')
      setUniversities(uni || [])
      setConsultancies(cons || [])
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (type: 'uni' | 'cons', id: string, key: string, value: boolean) => {
    if (type === 'uni') {
      setUniversities(prev => prev.map(u => u.id === id ? {
        ...u,
        permissions: { ...u.permissions, [key]: value }
      } : u))
    } else {
      setConsultancies(prev => prev.map(c => c.id === id ? {
        ...c,
        permissions: { ...c.permissions, [key]: value }
      } : c))
    }
  }

  const handleSaveAll = async () => {
    try {
      setLoading(true)
      // Save Universities
      for (const uni of universities) {
        await supabase.from('universities').update({ permissions: uni.permissions }).eq('id', uni.id)
      }
      // Save Consultancies
      for (const cons of consultancies) {
        await supabase.from('consultancies').update({ permissions: cons.permissions }).eq('id', cons.id)
      }
      alert("All permissions committed successfully!")
    } catch (err: any) {
      alert("Error saving: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const universityPermissions = [
    "edit_profile", "view_courses", "approve_admissions", "view_fee_ledger"
  ]

  const consultancyPermissions = [
    "manage_agents", "fee_approval", "view_ledger", "university_access"
  ]

  const PermissionRow = ({ entity, perm, type }: { entity: any, perm: string, type: 'uni' | 'cons' }) => {
    const keyMap: any = {
      // Uni
      'edit_profile': 'profile',
      'view_courses': 'courses',
      'approve_admissions': 'admissions',
      'view_fee_ledger': 'ledger',
      // Cons
      'manage_agents': 'agents',
      'fee_approval': 'admissions',
      'view_ledger': 'ledger',
      'university_access': 'universities'
    }
    const key = keyMap[perm] || perm
    const isChecked = entity.permissions?.[key] ?? true

    return (
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell className="font-bold py-4">{entity.name}</TableCell>
        <TableCell className="capitalize text-muted-foreground font-medium">{perm.replace(/_/g, ' ')}</TableCell>
        <TableCell>
          <Switch
            checked={isChecked}
            onCheckedChange={(val) => handlePermissionChange(type, entity.id, key, val)}
          />
        </TableCell>
        <TableCell><Switch checked={isChecked} disabled /></TableCell>
        <TableCell><Switch checked={isChecked} disabled /></TableCell>
      </TableRow>
    )
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
            <Lock className="w-8 h-8 text-primary" />
            Access Control Console
          </h1>
          <p className="text-muted-foreground mt-1">Granular permission management for network entities</p>
        </div>
        <Button
          className="h-11 px-8 font-black shadow-lg shadow-primary/20 bg-primary"
          onClick={handleSaveAll}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Commit Global Permissions
        </Button>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm"><ShieldCheck className="w-6 h-6 text-primary" /></div>
        <div>
          <p className="text-sm font-bold text-primary">Master Policy Mode Active</p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            You are currently editing the master permission set. These flags determine visible modules and interaction rights for University Portals and Consultancy Dashboards.
          </p>
        </div>
      </div>

      <Tabs defaultValue="universities" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-muted p-1 rounded-xl">
          <TabsTrigger value="universities" className="rounded-lg font-bold data-[state=active]:bg-white">Universities</TabsTrigger>
          <TabsTrigger value="consultancies" className="rounded-lg font-bold data-[state=active]:bg-white">Consultancies</TabsTrigger>
        </TabsList>

        <TabsContent value="universities" className="mt-6">
          <Card className="border-none shadow-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Entity</TableHead>
                  <TableHead className="font-bold">Privilege</TableHead>
                  <TableHead className="font-bold">Show</TableHead>
                  <TableHead className="font-bold">Read</TableHead>
                  <TableHead className="font-bold">Write</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
                ) : universities.map(u => (
                  universityPermissions.map(p => (
                    <PermissionRow key={`${u.id}-${p}`} entity={u} perm={p} type="uni" />
                  ))
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="consultancies" className="mt-6">
          <Card className="border-none shadow-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Entity</TableHead>
                  <TableHead className="font-bold">Privilege</TableHead>
                  <TableHead className="font-bold">Show</TableHead>
                  <TableHead className="font-bold">Read</TableHead>
                  <TableHead className="font-bold">Write</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
                ) : consultancies.map(c => (
                  consultancyPermissions.map(p => (
                    <PermissionRow key={`${c.id}-${p}`} entity={c} perm={p} type="cons" />
                  ))
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Categories Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'System Visibility', icon: ShieldCheck, color: 'text-blue-600', desc: 'Controls which menu items are visible in the sidebar.' },
          { label: 'Data Rights', icon: UserCog, color: 'text-purple-600', desc: 'Determines if the user can export or download PII data.' },
          { label: 'Mutation Locks', icon: Lock, color: 'text-red-600', desc: 'Enforces read-only mode for historical financial records.' },
        ].map((item, i) => (
          <Card key={i} className="p-6 border-none bg-slate-50 shadow-sm">
            <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
            <h4 className="font-black text-sm uppercase tracking-wider mb-2">{item.label}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
