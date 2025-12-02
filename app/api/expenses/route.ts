// Expenses API
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
    const apiUrl = `${backendUrl}/api/expenses${queryString ? `?${queryString}` : ''}`

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
    const expenses = backendData.data.map((expense: any) => ({
      id: expense._id,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0],
      status: expense.status,
      receipt_url: expense.receiptUrl,
    }))

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Expenses error:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
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
      category: body.category,
      amount: body.amount,
      description: body.description,
      date: body.date,
      status: body.status || 'pending',
      receiptUrl: body.receiptUrl,
    }

    // Send to backend API
    const backendUrl = 'https://perl-backend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/expenses`, {
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
    console.error("Create expense error:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 400 })
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
      category: body.category,
      amount: body.amount,
      description: body.description,
      status: body.status,
      approvedBy: body.approvedBy,
      approvedAt: body.approvedAt,
    }

    // Send to backend API
    const backendUrl = 'https://perl-backend-production.up.railway.app'
    const response = await fetch(`${backendUrl}/api/expenses/${id}`, {
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
    console.error("Update expense error:", error)
    return NextResponse.json({ error: "Failed to update expense" }, { status: 400 })
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
    const response = await fetch(`${backendUrl}/api/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json({ success: true, message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 400 })
  }
}
