// Courses API
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
    const apiUrl = `${backendUrl}/api/courses${queryString ? `?${queryString}` : ''}`

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
    const courses = backendData.data.map((course: any) => ({
      id: course._id,
      name: course.name,
      abbreviation: course.abbreviation,
      code: course.code,
      status: course.status,
      department: course.department,
      degreeType: course.degreeType,
      duration: course.duration,
      modeOfStudy: course.modeOfStudy,
      level: course.level,
      fees: course.fees,
      totalSeats: course.totalSeats,
      availableSeats: course.availableSeats,
      description: course.description,
      eligibility: course.eligibility,
      isActive: course.isActive,
      scholarshipAvailable: course.scholarshipAvailable,
      placementSupport: course.placementSupport,
      stream: course.department, // Map department to stream for display
      created_at: new Date(course.createdAt).toISOString().split('T')[0],
    }))

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Courses error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
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
      abbreviation: body.abbreviation,
      code: body.code,
      status: body.status || 'draft',
      department: body.department,
      degreeType: body.degreeType,
      duration: body.duration,
      modeOfStudy: body.modeOfStudy,
      level: body.level,
      fees: body.fees,
      totalSeats: body.totalSeats,
      availableSeats: body.availableSeats,
      description: body.description,
      eligibility: body.eligibility,
      isActive: body.isActive !== undefined ? body.isActive : true,
      scholarshipAvailable: body.scholarshipAvailable,
      placementSupport: body.placementSupport,
    }

    // Send to backend API
    const backendUrl = "https://perl-backend-env.up.railway.app"
    const response = await fetch(`${backendUrl}/api/courses`, {
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
    console.error("Create course error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 400 })
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
    const courseId = body.id

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Transform frontend data to backend format
    const backendData = {
      name: body.name,
      abbreviation: body.abbreviation,
      code: body.code,
      status: body.status,
      department: body.department,
      degreeType: body.degreeType,
      duration: body.duration,
      modeOfStudy: body.modeOfStudy,
      level: body.level,
      fees: body.fees,
      totalSeats: body.totalSeats,
      availableSeats: body.availableSeats,
      description: body.description,
      eligibility: body.eligibility,
      isActive: body.isActive,
      scholarshipAvailable: body.scholarshipAvailable,
      placementSupport: body.placementSupport,
    }

    // Send to backend API
    const backendUrl = "https://perl-backend-env.up.railway.app"
    const response = await fetch(`${backendUrl}/api/courses/${courseId}`, {
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
    console.error("Update course error:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 400 })
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
    const response = await fetch(`${backendUrl}/api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json({ success: true, message: "Course deleted successfully" })
  } catch (error) {
    console.error("Delete course error:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 400 })
  }
}
