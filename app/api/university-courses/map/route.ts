// University Courses Map API
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

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
      universityId: body.university_id,
      courseId: body.course_id,
      universityFee: body.university_fee,
      studentDisplayFee: body.student_display_fee,
      consultancyShareType: body.consultancy_share_type,
      consultancyShareValue: body.consultancy_share_value,
      totalSeats: body.total_seats,
      availableSeats: body.available_seats,
      autoSplitFee: body.auto_split_fee,
      oneTimeFees: body.one_time_fees || [],
    }

    // Send to backend API
    const backendUrl = 'https://perl-backend-env.up.railway.app'
    const response = await fetch(`${backendUrl}/api/university-courses/map`, {
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
    console.error("Map course error:", error)
    return NextResponse.json({ error: "Failed to map course to university" }, { status: 400 })
  }
}
