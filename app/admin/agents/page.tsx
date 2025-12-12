"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Eye, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AgentForm } from "@/components/admin/agent-form"
import { useToast } from "@/hooks/use-toast"

interface Agent {
  id: string
  name: string
  consultancy: string
  email: string
  phone: string
  wallet_balance: number
  total_commission_earned: number
  status: string
}

export default function AgentsPage() {
  const { data: session } = useSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (session?.accessToken) {
      fetchAgents()
    }
  }, [session])

  const fetchAgents = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://perl-backend-env.up.railway.app/'
      const response = await fetch(`${backendUrl}/api/agents`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Assuming backend returns data directly or wrapped in success response
        const agentsData = data.success ? data.data : data
        setAgents(agentsData)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch agents",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch agents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://perl-backend-env.up.railway.app/'
      const response = await fetch(`${backendUrl}/api/agents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      })

      if (response.ok) {
        setAgents(agents.filter((a) => a.id !== id))
        toast({
          title: "Success",
          description: "Agent deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete agent",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agents Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
            </DialogHeader>
            <AgentForm onSuccess={() => {
              setIsOpen(false)
              fetchAgents()
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Active Agents</p>
          <p className="text-3xl font-bold">{agents.filter((a) => a.status === "active").length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Commissions Earned</p>
          <p className="text-3xl font-bold">
            ₹{(agents.reduce((sum, a) => sum + a.total_commission_earned, 0) / 100000).toFixed(1)}L
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Wallet Balance</p>
          <p className="text-3xl font-bold">
            ₹{(agents.reduce((sum, a) => sum + a.wallet_balance, 0) / 1000).toFixed(0)}K
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Agents</p>
          <p className="text-3xl font-bold">{agents.length}</p>
        </Card>
      </div>

      {/* Agents Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead>Agent Name</TableHead>
                <TableHead>Consultancy</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Commission Earned</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} className="border-b border-border hover:bg-muted/50">
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="text-sm">{agent.consultancy}</TableCell>
                  <TableCell className="text-sm">{agent.email}</TableCell>
                  <TableCell className="text-sm">{agent.phone}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ₹{(agent.total_commission_earned / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="font-semibold">₹{(agent.wallet_balance / 1000).toFixed(0)}K</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(agent.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
