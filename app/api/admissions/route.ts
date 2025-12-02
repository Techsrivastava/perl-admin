// Admissions API
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Fetch data from backend API
    const backendUrl = 'http://localhost:5000'
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Build query string from search params
    const queryString = searchParams.toString()
    const apiUrl = `${backendUrl}/api/admissions${queryString ? `?${queryString}` : ''}`

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY || 'your-api-key'}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const backendData = await response.json()

    // Transform backend data to match frontend expectations
    const admissions = backendData.data.map((admission: any) => ({
      id: admission._id,
      student_name: admission.studentName,
      student_email: admission.studentEmail,
      course: admission.course?.name || 'Unknown Course',
      university: admission.university?.name || 'Unknown University',
      consultancy: admission.consultancy?.name || 'Unknown Consultancy',
      total_fee: admission.totalFee,
      fee_received: admission.feeReceived,
      status: admission.status,
      created_at: new Date(admission.createdAt).toISOString().split('T')[0],
    }))

    return NextResponse.json(admissions)
  } catch (error) {
    console.error("Admissions error:", error)
    return NextResponse.json({ error: "Failed to fetch admissions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Transform frontend data to backend format (this might need adjustment based on actual form data)
    const backendData = {
      studentName: body.studentName,
      studentEmail: body.studentEmail,
      course: body.course, // Should be ObjectId
      university: body.university, // Should be ObjectId
      consultancy: body.consultancy, // Should be ObjectId
      totalFee: body.totalFee,
      feeReceived: body.feeReceived || 0,
      status: body.status || 'pending',
    }

    // Send to backend API
    const backendUrl = 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/admissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY || 'your-api-key'}`,
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
    console.error("Create admission error:", error)
    return NextResponse.json({ error: "Failed to create admission" }, { status: 400 })
  }
}
