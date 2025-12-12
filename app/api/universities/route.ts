// Universities API
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
    const apiUrl = `${backendUrl}/api/universities${queryString ? `?${queryString}` : ''}`

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
    const universities = backendData.data.map((uni: any) => ({
      id: uni._id,
      name: uni.name,
      registration_number: `UNI-${uni._id.slice(-6).toUpperCase()}`,
      status: uni.isActive ? 'approved' : 'pending',
      contact_email: uni.contactEmail,
      total_students: Math.floor(Math.random() * 200) + 50, // Mock for now
      wallet_balance: Math.floor(Math.random() * 100000),
    }))

    return NextResponse.json(universities)
  } catch (error) {
    console.error("Universities error:", error)
    return NextResponse.json({ error: "Failed to fetch universities" }, { status: 500 })
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
      abbreviation: body.abbreviation || body.name.substring(0, 3).toUpperCase(),
      establishedYear: body.establishedYear || new Date().getFullYear(),
      type: body.type || 'Private',
      description: body.description || '',
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone || '',
      address: body.address || '',
    }

    // Send to backend API
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "https://perl-backend-env.up.railway.app").replace(/\/+$/, "")
    const response = await fetch(`${backendUrl}/api/universities`, {
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
    console.error("Create university error:", error)
    return NextResponse.json({ error: "Failed to create university" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      abbreviation: body.abbreviation || body.name?.substring(0, 3).toUpperCase(),
      establishedYear: body.establishedYear,
      type: body.type,
      description: body.description,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address,
    }

    // Send to backend API
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "https://perl-backend-env.up.railway.app").replace(/\/+$/, "")
    const response = await fetch(`${backendUrl}/api/universities/${id}`, {
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
    console.error("Update university error:", error)
    return NextResponse.json({ error: "Failed to update university" }, { status: 400 })
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
    const response = await fetch(`${backendUrl}/api/universities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json({ success: true, message: "University deleted successfully" })
  } catch (error) {
    console.error("Delete university error:", error)
    return NextResponse.json({ error: "Failed to delete university" }, { status: 400 })
  }
}
