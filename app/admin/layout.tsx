"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"
import { NotificationCenter } from "@/components/admin/notification-center"
import { Loader2 } from "lucide-react"

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading" || pathname === '/admin/login') return // Still loading or on login page

    if (!session || !session.user || (session.user.role !== 'superadmin' && session.user.role !== 'super_admin')) {
      router.push('/admin/login')
    }
  }, [session, status, router, pathname])

  if (pathname === '/admin/login') {
    return children
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !session.user || (session.user.role !== 'superadmin' && session.user.role !== 'super_admin')) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <NotificationCenter />
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  )
}
