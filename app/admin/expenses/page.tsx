"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash2, Edit2, Receipt, PieChart, Loader2, ArrowUpRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExpenseManagementModal } from "@/components/admin/expense-management-modal"
import { createClient } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

export default function ExpensesPage() {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error: any) {
      console.error('Error loading expenses:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure?")) return
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) alert(error.message)
    else loadExpenses()
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const categoryBreakdown = expenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {})

  const topCategory = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
            <Receipt className="w-8 h-8 text-primary" />
            Expenses Register
          </h1>
          <p className="text-muted-foreground mt-1">Track and audit operational expenditures</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Record Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary/5 p-6 border-b">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-heading">New Expense Entry</DialogTitle>
                </DialogHeader>
              </div>
              <div className="p-6">
                <ExpenseManagementModal
                  ownerType="super_admin"
                  onSuccess={() => {
                    setExpenseDialogOpen(false)
                    loadExpenses()
                    alert('Expense recorded!')
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2 border-muted h-11">
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-red-50/30 border-red-100 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-red-600 mb-2 uppercase tracking-wider">Total Outflow</p>
            <div className="p-2 bg-red-100 rounded-lg"><ArrowUpRight className="w-4 h-4 text-red-600" /></div>
          </div>
          <p className="text-3xl font-black text-red-700">₹{totalExpenses.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-blue-50/30 border-blue-100 shadow-sm">
          <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wider">Top Spend</p>
          <p className="text-3xl font-black text-blue-700 capitalize">{topCategory.replace(/_/g, " ")}</p>
        </Card>
        <Card className="p-6 bg-slate-50 border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total Entries</p>
          <p className="text-3xl font-black text-slate-800">{expenses.length}</p>
        </Card>
        <Card className="p-6 bg-primary text-white shadow-xl shadow-primary/10 border-none">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold opacity-80 mb-2 uppercase tracking-wider">Avg Expense</p>
            <PieChart className="w-5 h-5 opacity-50" />
          </div>
          <p className="text-3xl font-black">₹{expenses.length ? (totalExpenses / expenses.length).toFixed(0).toLocaleString() : 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table */}
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold">Entry</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="text-right font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                      No expense records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-muted/10 transition-colors group">
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm">{expense.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{expense.payment_mode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-[10px] font-bold tracking-tighter">
                          {expense.category.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-red-600 font-mono">₹{expense.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
        </Card>

        {/* Categories List */}
        <Card className="p-6 border-none shadow-md h-fit">
          <h3 className="text-lg font-bold font-heading mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Allocation
          </h3>
          <div className="space-y-6">
            {Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a).map(([category, amount]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold capitalize opacity-80">{category.replace(/_/g, " ")}</span>
                  <span className="font-black text-primary">₹{amount.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${(amount / totalExpenses) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
