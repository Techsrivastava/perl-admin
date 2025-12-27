"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Settings } from "lucide-react"
import { UniversityForm } from "@/components/admin/university-form"
import { UniversityPermissionsModal } from "@/components/admin/university-permissions-modal"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase"


interface University {
  id: string
  name: string
  registration_number: string
  status: string
  contact_email: string
  total_students: number
  wallet_balance: number
}

export default function UniversitiesPage() {
  const [token, setToken] = useState<string>('')
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUni, setSelectedUni] = useState<University | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Load universities data on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      loadUniversities()
    } else {
      setLoading(false)
      setError('No authentication token found')
    }
  }, [])


  const loadUniversities = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUniversities(data || [])
      setError(null)
    } catch (error) {
      console.error('Error loading universities:', error)
      setError('Failed to load universities')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this university?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('universities')
        .delete()
        .eq('id', id)

      if (error) throw error

      setUniversities(universities.filter((u) => u.id !== id))
      setDeleteConfirmId(null)
      alert("University deleted successfully!")
    } catch (error: any) {
      console.error('Error deleting university:', error)
      alert('Failed to delete university')
    }
  }

  const handleEdit = (uni: University) => {
    setSelectedUni(uni)
    setEditDialogOpen(true)
  }

  const handlePermissions = (uni: University) => {
    setSelectedUni(uni)
    setPermissionsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Universities Management</h1>
        <Sheet open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add University
            </Button>
          </SheetTrigger>
          <SheetContent className="min-w-[50vw] overflow-y-auto" side="right">
            <SheetHeader>
              <SheetTitle>Add New University</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <UniversityForm onSuccess={() => {
                setAddDialogOpen(false)
                loadUniversities() // Reload universities
              }} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading universities...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          {universities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No universities found. Add your first university to get started.
            </div>
          ) : (
            universities.map((uni) => (
              <Card key={uni.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{uni.name}</h3>
                        <p className="text-sm text-muted-foreground">Reg: {uni.registration_number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(uni.status)}`}>
                        {uni.status}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{uni.contact_email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Students</p>
                        <p className="font-medium">{uni.total_students}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Wallet</p>
                        <p className="font-medium">₹{(uni.wallet_balance / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" title="Permissions" onClick={() => handlePermissions(uni)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(uni)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {deleteConfirmId === uni.id ? (
                      <div className="flex gap-1">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(uni.id)}>
                          Confirm
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-red-600" title="Delete" onClick={() => setDeleteConfirmId(uni.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {/* Edit Sheet (was Dialog) */}
      <Sheet open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open)
        if (!open) setSelectedUni(null)
      }}>
        <SheetContent className="min-w-[50vw] overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>Edit University</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <UniversityForm
              editData={selectedUni}
              onSuccess={() => {
                setEditDialogOpen(false)
                setSelectedUni(null)
                loadUniversities() // Reload universities
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={(open) => {
        setPermissionsDialogOpen(open)
        if (!open) setSelectedUni(null)
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>University Permissions - {selectedUni?.name}</DialogTitle>
          </DialogHeader>
          <UniversityPermissionsModal
            universityId={selectedUni?.id}
            universityName={selectedUni?.name || ""}
            onSuccess={() => {
              setPermissionsDialogOpen(false)
              setSelectedUni(null)
              loadUniversities() // Reload universities
              alert('Permissions updated successfully!')
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
