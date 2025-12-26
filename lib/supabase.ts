import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing in environment variables. Falling back to hardcoded values for development.')
    // Fallback for immediate fix while env resolution is pending restart
    return createBrowserClient(
      'https://qsstqmwaayulyfnjwoom.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzc3RxbXdhYXl1bHlmbmp3b29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTE1OTMsImV4cCI6MjA4MjEyNzU5M30.biwt-8hEKL0JG6OmFr4GhEdsIEn9Ei8ub0882XwJgPg'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
