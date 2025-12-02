"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { BarChart3, Users, CreditCard, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profit Pulse EduConnect</h1>
            <p className="text-muted-foreground">Super Admin Management System</p>
          </div>
          <Link href="/admin">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Complete Dashboard</p>
                <p className="text-lg font-semibold">Overview & Analytics</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Management</p>
                <p className="text-lg font-semibold">Universities & Agents</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Financial Tracking</p>
                <p className="text-lg font-semibold">Wallets & Payments</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Control</p>
                <p className="text-lg font-semibold">Settings & Permissions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Key Features Implemented</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Dashboard & Overview</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Total universities, consultancies, agents count</li>
                <li>✓ Student admissions analytics</li>
                <li>✓ Financial summaries and charts</li>
                <li>✓ Wallet distribution visualization</li>
                <li>✓ Pending collections tracking</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">University Management</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Add/Edit/Delete universities</li>
                <li>✓ View university status and details</li>
                <li>✓ Track university wallet balance</li>
                <li>✓ Manage courses attached to university</li>
                <li>✓ Permission controls per university</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Admission Management</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ View all admissions with status</li>
                <li>✓ Approve/Reject/Revert admissions</li>
                <li>✓ Track fee collection progress</li>
                <li>✓ View admission details and documents</li>
                <li>✓ Calculate commissions automatically</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Financial System</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Payment tracking and management</li>
                <li>✓ Wallet management for all entities</li>
                <li>✓ Ledger records with transactions</li>
                <li>✓ Commission calculations</li>
                <li>✓ Financial reports & exports</li>
              </ul>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/admin">
            <Button size="lg" className="gap-2">
              Launch Super Admin Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
