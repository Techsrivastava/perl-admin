// Database connection and query utilities
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSupabaseClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsstqmwaayulyfnjwoom.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzc3RxbXdhYXl1bHlmbmp3b29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTE1OTMsImV4cCI6MjA4MjEyNzU5M30.biwt-8hEKL0JG6OmFr4GhEdsIEn9Ei8ub0882XwJgPg'

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })
}

export async function query(sql: string, params?: any[]) {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.rpc("execute_query", {
      query: sql,
      params: params || [],
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
