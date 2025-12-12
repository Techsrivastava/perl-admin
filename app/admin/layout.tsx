"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"
import { NotificationCenter } from "@/components/admin/notification-center"
import { Loader2 } from "lucide-react"

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === 'superadmin' || parsedUser.role === 'super_admin') {
        setUser(parsedUser)
      } else {
        router.push('/admin/login')
      }
    } else {
      router.push('/admin/login')
    }
    setLoading(false)
  }, [router, pathname])

  if (pathname === '/admin/login') {
    return children
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
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
