// Super Admin Dashboard API endpoint
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Fetch data from backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/dashboard`, {
      headers: {
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY || 'your-api-key'}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const backendData = await response.json()

    // Return the data from backend
    return NextResponse.json(backendData.data)
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
