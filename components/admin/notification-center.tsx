"use client"

import { Bell } from "lucide-react"
import { useState } from "react"

export function NotificationCenter() {
  const [notifications] = useState([
    { id: 1, title: "New Admission", message: "Amit Patel submitted admission form", time: "2 min ago" },
    { id: 2, title: "Fee Updated", message: "Payment received from Future Path Consultancy", time: "1 hour ago" },
  ])

  return (
    <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto hidden lg:block">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Recent Updates
      </h3>
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
          >
            <p className="font-medium text-sm">{notif.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
            <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
