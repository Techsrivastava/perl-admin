"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Permission {
  id: number
  entity: string
  entity_name: string
  permission: string
  show: boolean
  edit: boolean
  view: boolean
}

export default function PermissionsPage() {
  const [universities, setUniversities] = useState<Permission[]>([
    {
      id: 1,
      entity: "university",
      entity_name: "Delhi University",
      permission: "edit_profile",
      show: true,
      edit: true,
      view: true,
    },
    {
      id: 2,
      entity: "university",
      entity_name: "Delhi University",
      permission: "view_courses",
      show: true,
      edit: false,
      view: true,
    },
    {
      id: 3,
      entity: "university",
      entity_name: "Delhi University",
      permission: "approve_admissions",
      show: true,
      edit: true,
      view: true,
    },
    {
      id: 4,
      entity: "university",
      entity_name: "Delhi University",
      permission: "view_fee_ledger",
      show: true,
      edit: false,
      view: true,
    },
    {
      id: 5,
      entity: "university",
      entity_name: "Delhi University",
      permission: "update_fee_received",
      show: true,
      edit: true,
      view: true,
    },
    {
      id: 6,
      entity: "university",
      entity_name: "Mumbai University",
      permission: "edit_profile",
      show: true,
      edit: false,
      view: true,
    },
  ])

  const [consultancies, setConsultancies] = useState<Permission[]>([
    {
      id: 1,
      entity: "consultancy",
      entity_name: "Global Education",
      permission: "view_university_list",
      show: true,
      edit: false,
      view: true,
    },
    {
      id: 2,
      entity: "consultancy",
      entity_name: "Global Education",
      permission: "view_course_list",
      show: true,
      edit: false,
      view: true,
    },
    {
      id: 3,
      entity: "consultancy",
      entity_name: "Global Education",
      permission: "manage_agents",
      show: true,
      edit: true,
      view: true,
    },
    {
      id: 4,
      entity: "consultancy",
      entity_name: "Global Education",
      permission: "fee_approval",
      show: true,
      edit: true,
      view: true,
    },
    {
      id: 5,
      entity: "consultancy",
      entity_name: "Global Education",
      permission: "view_ledger",
      show: true,
      edit: false,
      view: true,
    },
  ])

  const permissionLabels: Record<string, string> = {
    edit_profile: "Edit Profile",
    view_courses: "View Courses",
    approve_admissions: "Approve Admissions",
    view_fee_ledger: "View Fee Ledger",
    update_fee_received: "Update Fee Received",
    view_student_documents: "View Student Documents",
    view_agent_details: "View Agent Details",
    view_university_list: "View University List",
    view_course_list: "View Course List",
    manage_agents: "Manage Agents",
    fee_approval: "Fee Approval",
    download_pdfs: "Download PDFs",
    expense_register_access: "Expense Register Access",
  }

  const handleUniversityPermissionChange = (id: number, field: "show" | "edit" | "view", value: boolean) => {
    setUniversities(universities.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleConsultancyPermissionChange = (id: number, field: "show" | "edit" | "view", value: boolean) => {
    setConsultancies(consultancies.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const PermissionRow = ({
    perm,
    onToggle,
  }: {
    perm: Permission
    onToggle: (id: number, field: "show" | "edit" | "view", value: boolean) => void
  }) => (
    <TableRow className="border-b border-border hover:bg-muted/50">
      <TableCell className="font-medium">{perm.entity_name}</TableCell>
      <TableCell>{permissionLabels[perm.permission] || perm.permission}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch checked={perm.show} onCheckedChange={(value) => onToggle(perm.id, "show", value)} />
          <span className="text-sm text-muted-foreground">{perm.show ? "Visible" : "Hidden"}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={perm.view}
            disabled={!perm.show}
            onCheckedChange={(value) => onToggle(perm.id, "view", value)}
          />
          <span className="text-sm text-muted-foreground">{perm.view ? "Can View" : "Cannot View"}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={perm.edit}
            disabled={!perm.show}
            onCheckedChange={(value) => onToggle(perm.id, "edit", value)}
          />
          <span className="text-sm text-muted-foreground">{perm.edit ? "Can Edit" : "Read Only"}</span>
        </div>
      </TableCell>
    </TableRow>
  )

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Role & Permission Engine</h1>

      <Tabs defaultValue="universities" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="universities">University Permissions</TabsTrigger>
          <TabsTrigger value="consultancies">Consultancy Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="universities" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">University Access Control</h3>
            <div className="text-sm text-muted-foreground mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
              Configure what each university can view, edit, and perform within the system. Use Show/Hide to control
              visibility, View to allow reading data, and Edit to allow modifications.
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/50">
                    <TableHead>University Name</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>View Access</TableHead>
                    <TableHead>Edit Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {universities.map((perm) => (
                    <PermissionRow key={perm.id} perm={perm} onToggle={handleUniversityPermissionChange} />
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button className="mt-6">Save University Permissions</Button>
          </Card>
        </TabsContent>

        <TabsContent value="consultancies" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Consultancy Access Control</h3>
            <div className="text-sm text-muted-foreground mb-6 p-4 bg-green-50 border border-green-200 rounded">
              Configure what each consultancy can view, edit, and perform. Consultancies can manage their own agents and
              view assigned courses and universities.
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/50">
                    <TableHead>Consultancy Name</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>View Access</TableHead>
                    <TableHead>Edit Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultancies.map((perm) => (
                    <PermissionRow key={perm.id} perm={perm} onToggle={handleConsultancyPermissionChange} />
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button className="mt-6">Save Consultancy Permissions</Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permission Categories Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Permission Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-blue-600">University Permissions</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Edit Profile - Update university information</li>
              <li>• View Courses - See available courses</li>
              <li>• Approve Admissions - Accept/reject students</li>
              <li>• View Fee Ledger - Track payments</li>
              <li>• Update Fee Received - Record payments</li>
              <li>• View Student Documents - Access submissions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-green-600">Consultancy Permissions</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• View University List - See all universities</li>
              <li>• View Course List - Browse courses</li>
              <li>• Manage Agents - Add/edit agents</li>
              <li>• Fee Approval - Approve fees</li>
              <li>• View Ledger - Check transactions</li>
              <li>• Download PDFs - Export documents</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-purple-600">Agent Permissions</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• View Courses - Browse available courses</li>
              <li>• View Commission - Track earnings</li>
              <li>• Submit Fee - Record payments</li>
              <li>• View Own Students - See generated leads</li>
              <li>• Download Slip - Generate receipts</li>
              <li>• Edit Profile - Update information</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
