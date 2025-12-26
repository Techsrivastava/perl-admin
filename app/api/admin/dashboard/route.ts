import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()

    // In a real production app, verify the user is a super_admin here using:
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    // if (profile?.role !== 'super_admin') throw new Error('Unauthorized')

    // 1. Fetch Counts
    const universities = await supabase.from('universities').select('*', { count: 'exact', head: true })
    const consultancies = await supabase.from('consultancies').select('*', { count: 'exact', head: true })
    const agents = await supabase.from('agents').select('*', { count: 'exact', head: true })
    const students = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
    const courses = await supabase.from('university_courses').select('*', { count: 'exact', head: true }) // Active courses
    const admissions = await supabase.from('admissions').select('*', { count: 'exact', head: true })

    // 2. Fetch Admission Breakdown
    const pendingAdm = await supabase.from('admissions').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    const approvedAdm = await supabase.from('admissions').select('*', { count: 'exact', head: true }).eq('approved')
    const revertedAdm = await supabase.from('admissions').select('*', { count: 'exact', head: true }).eq('reverted')

    // 3. Financials (Ledger)
    // Supabase JS doesn't do "SUM" well without an RPC or fetching all rows. 
    // For efficiency in a demo, we would assume an RPC 'get_dashboard_stats' exists, 
    // OR we fetch the ledger rows (less efficient but works for small data).
    // Let's use the 'ledger' table.
    const { data: ledgerData } = await supabase.from('ledger').select('amount, transaction_type, entity_type')

    let totalFeesCollected = 0
    let feesPaidToUni = 0
    let agentCommissions = 0
    let consultancyProfit = 0
    let systemProfit = 0

    // Wallet Summaries
    let uniWallet = 0
    let consWallet = 0
    let agentWallet = 0
    let adminWallet = 0

    ledgerData?.forEach((txn: any) => {
      // Simple logic for demo calculation
      if (txn.transaction_type === 'credit') {
        if (txn.entity_type === 'system') systemProfit += txn.amount
        if (txn.entity_type === 'university') uniWallet += txn.amount
        if (txn.entity_type === 'consultancy') consWallet += txn.amount
        if (txn.entity_type === 'agent') agentWallet += txn.amount
      } else {
        if (txn.entity_type === 'university') uniWallet -= txn.amount
        if (txn.entity_type === 'consultancy') consWallet -= txn.amount
        if (txn.entity_type === 'agent') agentWallet -= txn.amount
      }
    })

    // Construct Response
    const data = {
      total_universities: universities.count || 0,
      total_consultancies: consultancies.count || 0,
      total_agents: agents.count || 0,
      total_students: students.count || 0,
      total_courses: courses.count || 0,
      total_admissions: admissions.count || 0,
      pending_admissions: pendingAdm.count || 0,
      approved_admissions: approvedAdm.count || 0,
      reverted_admissions: revertedAdm.count || 0,
      total_fees_collected: totalFeesCollected, // Would come from specific ledger tag
      fees_paid_to_universities: feesPaidToUni,
      agent_commissions_paid: agentCommissions,
      consultancy_profit: consultancyProfit,
      system_profit: systemProfit,
      wallet_summary: {
        university_total: uniWallet,
        consultancy_total: consWallet,
        agent_total: agentWallet,
        super_admin_total: systemProfit
      },
      pending_fees: {
        pending_university_payments: 0,
        pending_agent_commissions: 0,
        pending_consultancy_earnings: 0
      },
      daily_expenses: 0
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
