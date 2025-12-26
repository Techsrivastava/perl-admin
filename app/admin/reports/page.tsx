"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Filter, TrendingUp, Users, Wallet, CreditCard, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAdmissions: 0,
    activeAdmissions: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  })
  const [admissionStatusData, setAdmissionStatusData] = useState<any[]>([])
  const [expenseDistribution, setExpenseDistribution] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setLoading(true)

      // 1. Fetch Admissions Summary
      const { data: admData } = await supabase.from('admissions').select('status')
      const admCount = admData?.length || 0
      const activeAdm = admData?.filter(a => a.status === 'approved').length || 0

      const statusMap = (admData || []).reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})

      setAdmissionStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })))

      // 2. Fetch Financials (Revenue from Ledger)
      const { data: revData } = await supabase.from('ledger').select('amount').eq('transaction_type', 'credit')
      const totalRev = (revData || []).reduce((sum, r) => sum + r.amount, 0)

      // 3. Fetch Expenses
      const { data: expData } = await supabase.from('expenses').select('amount, category')
      const totalExp = (expData || []).reduce((sum, e) => sum + e.amount, 0)

      const expMap = (expData || []).reduce((acc: any, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount
        return acc
      }, {})

      setExpenseDistribution(Object.entries(expMap).map(([name, value]) => ({ name, value })))

      setStats({
        totalAdmissions: admCount,
        activeAdmissions: activeAdm,
        totalRevenue: totalRev,
        totalExpenses: totalExp,
        netProfit: totalRev - totalExp
      })

    } catch (err: any) {
      console.error("Reports error:", err)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1"]

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center opacity-50">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <p className="font-bold text-lg animate-pulse">Analyzing system data...</p>
    </div>
  )

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Business Intelligence</h1>
          <p className="text-muted-foreground mt-1">Real-time performance and financial metrics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent border-muted">
            <Filter className="w-4 h-4" />
            Time Range: All
          </Button>
          <Button className="gap-2 bg-primary shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-sm bg-blue-50/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Total Admissions</p>
              <p className="text-3xl font-black text-blue-900">{stats.totalAdmissions}</p>
            </div>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
        </Card>
        <Card className="p-6 border-none shadow-sm bg-green-50/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Gross Revenue</p>
              <p className="text-3xl font-black text-green-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <Wallet className="w-5 h-5 text-green-400" />
          </div>
        </Card>
        <Card className="p-6 border-none shadow-sm bg-red-50/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Total Expenses</p>
              <p className="text-3xl font-black text-red-900">₹{stats.totalExpenses.toLocaleString()}</p>
            </div>
            <CreditCard className="w-5 h-5 text-red-400" />
          </div>
        </Card>
        <Card className="p-6 border-none shadow-xl bg-primary text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">Net System Profit</p>
              <p className="text-3xl font-black">₹{stats.netProfit.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-5 h-5 opacity-40" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Admission Distribution */}
        <Card className="p-6 border-none shadow-md">
          <h3 className="text-lg font-bold font-heading mb-6">Admission Pipeline Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={admissionStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} className="capitalize" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Distribution */}
        <Card className="p-6 border-none shadow-md">
          <h3 className="text-lg font-bold font-heading mb-6">Expense Weightage</h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Reports Actions */}
      <Card className="p-10 border-none shadow-md bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 blur-[100px] -z-0" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="text-2xl font-bold font-heading mb-2">Audit Central</h4>
            <p className="text-sm text-slate-400">Generate certified reports for financial reconciliation and university audits.</p>
          </div>
          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'Admission Master List',
              'Ledger Audit Trial',
              'Entity Wallet Export',
              'Commission Summary',
              'Expense Register',
              'Tax Statement'
            ].map((name) => (
              <Button key={name} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white text-xs h-12 justify-start truncate">
                <Download className="w-3 h-3 mr-2" /> {name}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
