"use client"

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
import { Download, Filter } from "lucide-react"

export default function ReportsPage() {
  const admissionData = [
    { name: "Week 1", pending: 12, approved: 35, reverted: 2 },
    { name: "Week 2", pending: 8, approved: 42, reverted: 3 },
    { name: "Week 3", pending: 15, approved: 45, reverted: 1 },
    { name: "Week 4", pending: 10, approved: 38, reverted: 4 },
  ]

  const financialData = [
    { name: "Week 1", collected: 850000, paid: 620000, profit: 230000 },
    { name: "Week 2", collected: 920000, paid: 680000, profit: 240000 },
    { name: "Week 3", collected: 780000, paid: 590000, profit: 190000 },
    { name: "Week 4", collected: 950000, paid: 710000, profit: 240000 },
  ]

  const expenseData = [
    { name: "Office", value: 50000 },
    { name: "Staff", value: 120000 },
    { name: "Travel", value: 35000 },
    { name: "Marketing", value: 95000 },
    { name: "Misc", value: 20000 },
  ]

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Admission Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Admission Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={admissionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pending" fill="#f59e0b" />
            <Bar dataKey="approved" fill="#10b981" />
            <Bar dataKey="reverted" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Financial Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={financialData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
            <Legend />
            <Line type="monotone" dataKey="collected" stroke="#10b981" name="Collected" />
            <Line type="monotone" dataKey="paid" stroke="#ef4444" name="Paid" />
            <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}K`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Summary Stats</h3>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Admissions</p>
              <p className="text-2xl font-bold">380</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">₹45L</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-2xl font-bold">₹3.2L</p>
            </div>
            <div className="p-4 border border-border rounded-lg bg-green-50">
              <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
              <p className="text-2xl font-bold text-green-600">₹10.5L</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Generation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
            <Download className="w-5 h-5" />
            <span>Admission Report</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
            <Download className="w-5 h-5" />
            <span>Financial Report</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
            <Download className="w-5 h-5" />
            <span>Ledger Report</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
            <Download className="w-5 h-5" />
            <span>Expense Report</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
            <Download className="w-5 h-5" />
            <span>University Summary</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
            <Download className="w-5 h-5" />
            <span>Commission Report</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
