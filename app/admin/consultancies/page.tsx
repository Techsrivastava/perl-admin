"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ConsultancyForm } from "@/components/admin/consultancy-form"

interface Consultancy {
  id: number
  name: string
  owner_name: string
  status: string
  contact_email: string
  wallet_balance: number
  total_collected: number
  net_profit: number
}

export default function ConsultanciesPage() {
  const { data: session } = useSession()
  const [consultancies, setConsultancies] = useState<Consultancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Load consultancies data on component mount
  useEffect(() => {
    if (session?.accessToken) {
      loadConsultancies()
    }
  }, [session])

  const loadConsultancies = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await fetch(`${backendUrl}/api/consultancies`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Assuming backend returns data directly or wrapped in success response
        const consultanciesData = data.success ? data.data : data
        setConsultancies(consultanciesData)
      } else {
        setError('Failed to load consultancies')
      }
    } catch (error) {
      console.error('Error loading consultancies:', error)
      setError('Failed to load consultancies')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = (id: number) => {
    setConsultancies(consultancies.filter((c) => c.id !== id))
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Consultancies Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Consultancy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Consultancy</DialogTitle>
            </DialogHeader>
            <ConsultancyForm onSuccess={() => {
              setIsOpen(false)
              loadConsultancies() // Reload consultancies
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading consultancies...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {consultancies.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No consultancies found. Add your first consultancy to get started.
            </div>
          ) : (
            consultancies.map((consultancy) => (
            <Card key={consultancy.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{consultancy.name}</h3>
                  <p className="text-sm text-muted-foreground">Owner: {consultancy.owner_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultancy.status)}`}>
                  {consultancy.status}
                </span>
              </div>

              <div className="space-y-3 mb-4 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{consultancy.contact_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Collected:</span>
                  <span className="font-medium">₹{(consultancy.total_collected / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Profit:</span>
                  <span className="font-medium">₹{(consultancy.net_profit / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet Balance:</span>
                  <span className="font-medium">₹{(consultancy.wallet_balance / 1000).toFixed(0)}K</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-600"
                  onClick={() => handleDelete(consultancy.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
          )}
        </div>
      )}
    </div>
  )
}
