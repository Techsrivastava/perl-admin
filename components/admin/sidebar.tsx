"use client"

import Link from "next/link"
import { useState } from "react"
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  CreditCard,
  LogOut,
  ChevronDown,
  Settings,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    {
      label: "Management",
      icon: Building2,
      submenu: [
        { label: "Universities", href: "/admin/universities" },
        { label: "Consultancies", href: "/admin/consultancies" },
        { label: "Agents", href: "/admin/agents" },
      ],
    },
    { label: "Courses", icon: BookOpen, href: "/admin/courses" },
    { label: "Admissions", icon: Users, href: "/admin/admissions" },
    { label: "Payments", icon: CreditCard, href: "/admin/payments" },
    { label: "Wallet & Ledger", icon: CreditCard, href: "/admin/wallet" },
    { label: "Expenses", icon: CreditCard, href: "/admin/expenses" },
    { label: "Reports", icon: BarChart3, href: "/admin/reports" },
    { label: "Landing CMS", icon: Building2, href: "/admin/landing" }, // Added Landing Page
    { label: "Permissions", icon: Settings, href: "/admin/permissions" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sidebar-foreground">Profit Pulse</h1>
        <p className="text-xs text-sidebar-foreground/60">Super Admin Dashboard</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.submenu ? (
              <button
                onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${expanded === item.label ? "rotate-180" : ""}`}
                />
              </button>
            ) : (
              <Link href={item.href || "#"}>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )}

            {item.submenu && expanded === item.label && (
              <div className="ml-8 space-y-1">
                {item.submenu.map((sub) => (
                  <Link key={sub.label} href={sub.href}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      {sub.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <Button variant="destructive" className="w-full gap-2">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  )
}
