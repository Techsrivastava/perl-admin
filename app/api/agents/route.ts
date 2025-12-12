// Agents API
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch data from backend API
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "https://perl-backend-env.up.railway.app").replace(/\/+$/, "")
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Build query string from search params
    const queryString = searchParams.toString()
    const apiUrl = `${backendUrl}/api/agents${queryString ? `?${queryString}` : ''}`

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const backendData = await response.json()

    // Transform backend data to match frontend expectations
    const agents = backendData.data.map((agent: any) => ({
      id: agent._id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      consultancy: agent.consultancy?.name || 'Unknown Consultancy',
      commission_rate: agent.commissionRate,
      status: agent.status,
      wallet_balance: agent.walletBalance,
      total_commission_earned: agent.totalCommissionEarned,
    }))

    return NextResponse.json(agents)
  } catch (error) {
    console.error("Agents error:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Transform frontend data to backend format
    const backendData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      consultancy: body.consultancy, // Should be ObjectId
      commissionRate: body.commissionRate,
      status: body.status || 'active',
    }

    // Send to backend API
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "https://perl-backend-env.up.railway.app").replace(/\/+$/, "")
    const response = await fetch(`${backendUrl}/api/agents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const backendResponse = await response.json()

    return NextResponse.json({ success: true, id: backendResponse.data._id }, { status: 201 })
  } catch (error) {
    console.error("Create agent error:", error)
    return NextResponse.json({ error: "Failed to create agent" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop() // Extract ID from URL

    // Transform frontend data to backend format
    const backendData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      consultancy: body.consultancy,
      commissionRate: body.commissionRate,
      status: body.status,
    }

    // Send to backend API
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "https://perl-backend-env.up.railway.app").replace(/\/+$/, "")
    const response = await fetch(`${backendUrl}/api/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const backendResponse = await response.json()

    return NextResponse.json({ success: true, data: backendResponse.data })
  } catch (error) {
    console.error("Update agent error:", error)
    return NextResponse.json({ error: "Failed to update agent" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop() // Extract ID from URL

    // Send to backend API
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "https://perl-backend-env.up.railway.app").replace(/\/+$/, "")
    const response = await fetch(`${backendUrl}/api/agents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json({ success: true, message: "Agent deleted successfully" })
  } catch (error) {
    console.error("Delete agent error:", error)
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 400 })
  }
}
