// Consultancies API
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
    const backendUrl = 'https://perl-backend-production.up.railway.app'
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Build query string from search params
    const queryString = searchParams.toString()
    const apiUrl = `${backendUrl}/api/consultancies${queryString ? `?${queryString}` : ''}`

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
    const consultancies = backendData.data.map((cons: any) => ({
      id: cons._id,
      name: cons.name,
      owner_name: cons.ownerName,
      status: cons.isActive ? 'approved' : 'pending',
      contact_email: cons.contactEmail,
      wallet_balance: Math.floor(Math.random() * 200000), // Mock for now
      total_collected: Math.floor(Math.random() * 1000000) + 500000, // Mock for now
      net_profit: Math.floor(Math.random() * 200000), // Mock for now
    }))

    return NextResponse.json(consultancies)
  } catch (error) {
    console.error("Consultancies error:", error)
    return NextResponse.json({ error: "Failed to fetch consultancies" }, { status: 500 })
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
      ownerName: body.ownerName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone || '',
      address: body.address || '',
      description: body.description || '',
    }

    // Send to backend API
    const backendUrl = 'https://perl-backend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/consultancies`, {
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
    console.error("Create consultancy error:", error)
    return NextResponse.json({ error: "Failed to create consultancy" }, { status: 400 })
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
      ownerName: body.ownerName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address,
      description: body.description,
      status: body.status,
    }

    // Send to backend API
    const backendUrl = 'https://perl-backend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/consultancies/${id}`, {
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
    console.error("Update consultancy error:", error)
    return NextResponse.json({ error: "Failed to update consultancy" }, { status: 400 })
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
    const backendUrl = 'https://perl-backend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/consultancies/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json({ success: true, message: "Consultancy deleted successfully" })
  } catch (error) {
    console.error("Delete consultancy error:", error)
    return NextResponse.json({ error: "Failed to delete consultancy" }, { status: 400 })
  }
}
