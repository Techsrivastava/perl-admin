// Payments API
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
    const backendUrl = "https://perl-backend-env.up.railway.app"
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Build query string from search params
    const queryString = searchParams.toString()
    const apiUrl = `${backendUrl}/api/payments${queryString ? `?${queryString}` : ''}`

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
    const payments = backendData.data.map((payment: any) => ({
      id: payment._id,
      admission_id: payment.admission,
      student_name: payment.studentName,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      date: new Date(payment.date).toISOString().split('T')[0],
      reference: payment.reference,
      notes: payment.notes,
    }))

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Payments error:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
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
      admission: body.admissionId,
      amount: body.amount,
      method: body.method,
      reference: body.reference,
      notes: body.notes,
    }

    // Send to backend API
    const backendUrl = "https://perl-backend-env.up.railway.app"
    const response = await fetch(`${backendUrl}/api/payments`, {
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
    console.error("Create payment error:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 400 })
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
      amount: body.amount,
      method: body.method,
      status: body.status,
      date: body.date,
      reference: body.reference,
      notes: body.notes,
    }

    // Send to backend API
    const backendUrl = "https://perl-backend-env.up.railway.app"
    const response = await fetch(`${backendUrl}/api/payments/${id}`, {
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
    console.error("Update payment error:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 400 })
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
    const backendUrl = "https://perl-backend-env.up.railway.app"
    const response = await fetch(`${backendUrl}/api/payments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json({ success: true, message: "Payment deleted successfully" })
  } catch (error) {
    console.error("Delete payment error:", error)
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 400 })
  }
}
