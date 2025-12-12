"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Building2, Briefcase, Users, TrendingUp, DollarSign, RefreshCw } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  total_universities: number
  total_consultancies: number
  total_agents: number
  total_students: number
  total_courses: number
  total_admissions: number
  pending_admissions: number
  approved_admissions: number
  reverted_admissions: number
  total_fees_collected: number
  fees_paid_to_universities: number
  agent_commissions_paid: number
  consultancy_profit: number
  system_profit: number
  wallet_summary: {
    university_total: number
    consultancy_total: number
    agent_total: number
    super_admin_total: number
  }
  pending_fees: {
    pending_university_payments: number
    pending_agent_commissions: number
    pending_consultancy_earnings: number
  }
  daily_expenses: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { data: session } = useSession()

  const fetchDashboardData = async (showToast = false) => {
    if (!session?.accessToken) return

    try {
      setRefreshing(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://perl-backend-env.up.railway.app/api/'
      const response = await fetch(`${backendUrl}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
        if (showToast) {
          toast({
            title: "Success",
            description: "Dashboard data refreshed successfully.",
          })
        }
      } else {
        throw new Error(data.message || 'Failed to load dashboard')
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [session])

  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  if (loading) return <div className="p-8">Loading dashboard...</div>
  if (!stats) return <div className="p-8">Failed to load dashboard</div>

  const chartData = [
    { name: "Universities", value: stats.wallet_summary.university_total },
    { name: "Consultancies", value: stats.wallet_summary.consultancy_total },
    { name: "Agents", value: stats.wallet_summary.agent_total },
    { name: "System", value: stats.wallet_summary.super_admin_total },
  ]

  const admissionData = [
    { name: "Pending", value: stats.pending_admissions },
    { name: "Approved", value: stats.approved_admissions },
    { name: "Reverted", value: stats.reverted_admissions },
  ]

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b"]

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Building2} title="Total Universities" value={stats.total_universities} color="bg-blue-500" />
        <StatCard icon={Briefcase} title="Total Consultancies" value={stats.total_consultancies} color="bg-green-500" />
        <StatCard icon={Users} title="Total Agents" value={stats.total_agents} color="bg-purple-500" />
        <StatCard icon={Users} title="Total Students" value={stats.total_students} color="bg-orange-500" />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={TrendingUp} title="Total Courses" value={stats.total_courses} color="bg-indigo-500" />
        <StatCard icon={DollarSign} title="Total Admissions" value={stats.total_admissions} color="bg-teal-500" />
        <StatCard icon={Users} title="Pending Admissions" value={stats.pending_admissions} color="bg-yellow-500" />
        <StatCard icon={DollarSign} title="Daily Expenses" value={`₹${stats.daily_expenses.toLocaleString()}`} color="bg-red-500" />
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Fees Collected"
          value={`₹${(stats.total_fees_collected / 100000).toFixed(1)}L`}
          color="bg-green-600"
        />
        <StatCard
          icon={TrendingUp}
          title="System Profit"
          value={`₹${(stats.system_profit / 100000).toFixed(1)}L`}
          color="bg-blue-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Wallet Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Admission Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={admissionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Pending Fees */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Pending Collections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Pending University Payments</p>
            <p className="text-2xl font-bold">
              ₹{(stats.pending_fees.pending_university_payments / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Pending Agent Commissions</p>
            <p className="text-2xl font-bold">₹{(stats.pending_fees.pending_agent_commissions / 100000).toFixed(1)}L</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Pending Consultancy Earnings</p>
            <p className="text-2xl font-bold">
              ₹{(stats.pending_fees.pending_consultancy_earnings / 100000).toFixed(1)}L
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
