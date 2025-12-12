// Wallet API
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Fetch data from backend API
    const backendUrl = 'https://perl-backend-env.up.railway.app'
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Build query string from search params
    const queryString = searchParams.toString()
    const apiUrl = `${backendUrl}/api/wallets${queryString ? `?${queryString}` : ''}`

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
    const wallets = backendData.data.map((wallet: any) => ({
      id: wallet._id,
      owner_type: wallet.ownerType,
      owner_id: wallet.owner,
      balance: wallet.balance,
      transactions: wallet.transactions,
    }))

    return NextResponse.json(wallets)
  } catch (error) {
    console.error("Wallets error:", error)
    return NextResponse.json({ error: "Failed to fetch wallets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    const backendUrl = 'https://perl-backend-env.up.railway.app'

    if (action === 'adjust') {
      // Wallet adjustment
      const response = await fetch(`${backendUrl}/api/wallets/${body.ownerType}/${body.ownerId}/adjust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BACKEND_API_KEY || 'your-api-key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: body.type,
          amount: body.amount,
          reason: body.reason,
          reference: body.reference,
          notes: body.notes,
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`)
      }

      const backendResponse = await response.json()
      return NextResponse.json({ success: true, data: backendResponse.data })

    } else if (action === 'transfer') {
      // Fund transfer
      const response = await fetch(`${backendUrl}/api/wallets/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BACKEND_API_KEY || 'your-api-key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromType: body.fromType,
          fromId: body.fromId,
          toType: body.toType,
          toId: body.toId,
          amount: body.amount,
          reason: body.reason,
          notes: body.notes,
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`)
      }

      const backendResponse = await response.json()
      return NextResponse.json({ success: true, data: backendResponse.data })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Wallet operation error:", error)
    return NextResponse.json({ error: "Failed to perform wallet operation" }, { status: 400 })
  }
}
