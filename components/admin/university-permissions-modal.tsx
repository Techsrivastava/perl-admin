"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"

interface PermissionSet {
  view: boolean
  create: boolean
  edit: boolean
  approve: boolean
  delete: boolean
  download: boolean
}

interface UniversityPermissions {
  courses: Omit<PermissionSet, "create" | "delete"> & { map: boolean }
  admissions: PermissionSet
  ledger: Omit<PermissionSet, "create" | "delete" | "approve">
  documents: Omit<PermissionSet, "approve">
  wallet: Omit<PermissionSet, "create" | "delete" | "approve"> & { adjust: boolean }
}

interface UniversityPermissionsModalProps {
  universityId?: string
  universityName?: string
  onSuccess?: () => void
}

export function UniversityPermissionsModal({
  universityId,
  universityName = "University",
  onSuccess,
}: UniversityPermissionsModalProps) {
  const [permissions, setPermissions] = useState<UniversityPermissions>({
    courses: { view: true, edit: false, approve: false, download: true, map: false },
    admissions: { view: true, create: false, edit: false, approve: true, delete: false, download: true },
    ledger: { view: true, edit: false, download: true },
    documents: { view: true, create: true, edit: false, delete: false, download: true },
    wallet: { view: true, edit: false, download: true, adjust: false },
  })

  const [loading, setLoading] = useState(false)

  const handleToggle = (module: keyof UniversityPermissions, permission: string) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: !prev[module][permission as keyof typeof prev[typeof module]],
      },
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/universities/${universityId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissions),
      })

      if (response.ok) {
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to update permissions:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-h-[65vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">University Permissions</h3>
        <p className="text-sm text-muted-foreground">Configure access permissions for {universityName}</p>
      </div>

      {/* Courses Module */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Courses Module</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="courses-view">View Courses</Label>
            <Switch
              id="courses-view"
              checked={permissions.courses.view}
              onCheckedChange={() => handleToggle("courses", "view")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="courses-edit">Edit Course Details</Label>
            <Switch
              id="courses-edit"
              checked={permissions.courses.edit}
              onCheckedChange={() => handleToggle("courses", "edit")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="courses-approve">Approve Course Mapping</Label>
            <Switch
              id="courses-approve"
              checked={permissions.courses.approve}
              onCheckedChange={() => handleToggle("courses", "approve")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="courses-download">Download Course Data</Label>
            <Switch
              id="courses-download"
              checked={permissions.courses.download}
              onCheckedChange={() => handleToggle("courses", "download")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="courses-map">Map Courses</Label>
            <Switch
              id="courses-map"
              checked={permissions.courses.map}
              onCheckedChange={() => handleToggle("courses", "map")}
            />
          </div>
        </div>
      </Card>

      {/* Admissions Module */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Admissions Module</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="admissions-view">View Admissions</Label>
            <Switch
              id="admissions-view"
              checked={permissions.admissions.view}
              onCheckedChange={() => handleToggle("admissions", "view")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="admissions-create">Create Admission</Label>
            <Switch
              id="admissions-create"
              checked={permissions.admissions.create}
              onCheckedChange={() => handleToggle("admissions", "create")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="admissions-edit">Edit Admission</Label>
            <Switch
              id="admissions-edit"
              checked={permissions.admissions.edit}
              onCheckedChange={() => handleToggle("admissions", "edit")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="admissions-approve">
              <span className="font-semibold">Approve/Reject Admission</span>
              <span className="block text-xs text-muted-foreground">Critical permission</span>
            </Label>
            <Switch
              id="admissions-approve"
              checked={permissions.admissions.approve}
              onCheckedChange={() => handleToggle("admissions", "approve")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="admissions-delete">Delete Admission</Label>
            <Switch
              id="admissions-delete"
              checked={permissions.admissions.delete}
              onCheckedChange={() => handleToggle("admissions", "delete")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="admissions-download">Download Admission Data</Label>
            <Switch
              id="admissions-download"
              checked={permissions.admissions.download}
              onCheckedChange={() => handleToggle("admissions", "download")}
            />
          </div>
        </div>
      </Card>

      {/* Ledger Module */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Ledger & Financial Module</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="ledger-view">View Ledger</Label>
            <Switch
              id="ledger-view"
              checked={permissions.ledger.view}
              onCheckedChange={() => handleToggle("ledger", "view")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ledger-edit">Edit Ledger Entries</Label>
            <Switch
              id="ledger-edit"
              checked={permissions.ledger.edit}
              onCheckedChange={() => handleToggle("ledger", "edit")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ledger-download">Download Ledger Report</Label>
            <Switch
              id="ledger-download"
              checked={permissions.ledger.download}
              onCheckedChange={() => handleToggle("ledger", "download")}
            />
          </div>
        </div>
      </Card>

      {/* Documents Module */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Documents Module</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="documents-view">View Documents</Label>
            <Switch
              id="documents-view"
              checked={permissions.documents.view}
              onCheckedChange={() => handleToggle("documents", "view")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="documents-create">Upload Documents</Label>
            <Switch
              id="documents-create"
              checked={permissions.documents.create}
              onCheckedChange={() => handleToggle("documents", "create")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="documents-edit">Edit/Replace Documents</Label>
            <Switch
              id="documents-edit"
              checked={permissions.documents.edit}
              onCheckedChange={() => handleToggle("documents", "edit")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="documents-delete">Delete Documents</Label>
            <Switch
              id="documents-delete"
              checked={permissions.documents.delete}
              onCheckedChange={() => handleToggle("documents", "delete")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="documents-download">Download Documents</Label>
            <Switch
              id="documents-download"
              checked={permissions.documents.download}
              onCheckedChange={() => handleToggle("documents", "download")}
            />
          </div>
        </div>
      </Card>

      {/* Wallet Module */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Wallet Module</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="wallet-view">View Wallet Balance</Label>
            <Switch
              id="wallet-view"
              checked={permissions.wallet.view}
              onCheckedChange={() => handleToggle("wallet", "view")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="wallet-edit">Edit Wallet Details</Label>
            <Switch
              id="wallet-edit"
              checked={permissions.wallet.edit}
              onCheckedChange={() => handleToggle("wallet", "edit")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="wallet-download">Download Wallet Report</Label>
            <Switch
              id="wallet-download"
              checked={permissions.wallet.download}
              onCheckedChange={() => handleToggle("wallet", "download")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="wallet-adjust">
              <span className="font-semibold">Adjust Balance (Add/Deduct)</span>
              <span className="block text-xs text-muted-foreground">High-risk permission</span>
            </Label>
            <Switch
              id="wallet-adjust"
              checked={permissions.wallet.adjust}
              onCheckedChange={() => handleToggle("wallet", "adjust")}
            />
          </div>
        </div>
      </Card>

      <Separator />

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Permissions"}
        </Button>
      </div>
    </div>
  )
}
