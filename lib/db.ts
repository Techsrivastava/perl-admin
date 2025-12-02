// Database connection and query utilities
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
