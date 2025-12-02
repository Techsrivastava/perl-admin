"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash2, Edit2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ExpenseManagementModal } from "@/components/admin/expense-management-modal"

interface Expense {
  id: number
  category: string
  amount: number
  description: string
  date: string
  approver: string
  receipt: string
}

export default function ExpensesPage() {
  const { data: session } = useSession()
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load expenses data on component mount
  useEffect(() => {
    if (session?.accessToken) {
      loadExpenses()
    }
  }, [session])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await fetch(`${backendUrl}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Assuming backend returns data directly or wrapped in success response
        const expensesData = data.success ? data.data : data
        setExpenses(expensesData)
      } else {
        setError('Failed to load expenses')
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const [newExpense, setNewExpense] = useState({
    category: "Office",
    amount: "",
    description: "",
    approver: "Admin",
  })

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.description) {
      const expense: Expense = {
        id: Math.max(...expenses.map((e) => e.id), 0) + 1,
        category: newExpense.category,
        amount: Number.parseInt(newExpense.amount),
        description: newExpense.description,
        date: new Date().toISOString().split("T")[0],
        approver: newExpense.approver,
        receipt: `RCP-${String(Math.max(...expenses.map((e) => Number.parseInt(e.receipt.split("-")[1])), 0) + 1).padStart(3, "0")}`,
      }
      setExpenses([...expenses, expense])
      setNewExpense({ category: "Office", amount: "", description: "", approver: "Admin" })
    }
  }

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter((e) => e.id !== id))
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const categoryBreakdown = expenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {})

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Office: "bg-blue-100 text-blue-800",
      Staff: "bg-green-100 text-green-800",
      Travel: "bg-purple-100 text-purple-800",
      Marketing: "bg-orange-100 text-orange-800",
      Misc: "bg-gray-100 text-gray-800",
    }
    return colors[category] || colors.Misc
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Expenses Register</h1>
        <div className="flex gap-2">
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <ExpenseManagementModal 
                ownerType="super_admin"
                onSuccess={() => {
                  setExpenseDialogOpen(false)
                  loadExpenses() // Reload expenses
                  alert('Expense added successfully!')
                }} 
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
          <p className="text-3xl font-bold">₹{(totalExpenses / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Monthly Average</p>
          <p className="text-3xl font-bold">₹{((totalExpenses * 2.5) / 100000).toFixed(1)}L</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Entries</p>
          <p className="text-3xl font-bold">{expenses.length}</p>
        </Card>
        <Card className="p-6 bg-primary text-primary-foreground">
          <p className="text-sm opacity-90 mb-2">Highest Category</p>
          <p className="text-3xl font-bold">
            {Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
          </p>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
        <div className="space-y-3">
          {Object.entries(categoryBreakdown).map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="font-medium">{category}</span>
              <div className="flex items-center gap-4">
                <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(amount / totalExpenses) * 100}%` }} />
                </div>
                <span className="font-semibold w-24 text-right">₹{(amount / 1000).toFixed(0)}K</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Expense Records</h3>
        {loading ? (
          <div className="text-center py-8">Loading expenses...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead>Receipt</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No expenses found. Add your first expense to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{expense.receipt}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(expense.category)}`}
                        >
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="font-semibold">₹{expense.amount.toLocaleString()}</TableCell>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>{expense.approver}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
