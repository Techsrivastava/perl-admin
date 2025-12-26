"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"

import { createClient } from "@/lib/supabase"


export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@perl.com")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = createClient()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.session) {
        // Check if user is super_admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')

          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'super_admin') {
          // Store token and user data for Layout to verify
          localStorage.setItem('token', data.session.access_token)
          localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            role: profile.role,
            full_name: profile.full_name
          }))

          window.location.href = '/admin'
        } else {
          await supabase.auth.signOut()
          setError("Unauthorized: Access restricted to Super Admins.")
        }
      }
    } catch (error: any) {
      setError(error.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)
    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@perl.com',
        password: 'password123',
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Create Profile (if not exists)
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: 'admin@perl.com',
          full_name: 'Super Administrator',
          role: 'super_admin',
          status: 'approved'
        })

        if (profileError) {
          console.error('Profile creation failed:', profileError)
          // If profile fails, it might exist, just try logging in
        }

        toast({ title: "Admin Created", description: "You can now log in." })

        // Auto Login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'admin@perl.com',
          password: 'password123',
        })

        if (!loginError && loginData.session) {
          localStorage.setItem('token', loginData.session.access_token)
          localStorage.setItem('user', JSON.stringify({
            id: authData.user.id,
            email: 'admin@perl.com',
            role: 'super_admin',
            full_name: 'Super Administrator'
          }))
          window.location.href = '/admin'
        }
      }
    } catch (error: any) {
      console.error('Registration/Fix error:', error)
      if (error.message && error.message.includes('already registered')) {
        toast({
          variant: "destructive",
          title: "User Already Exists",
          description: "Please run 'repair_admin.sql' in Supabase SQL Editor to reset this user, then try again."
        })
      } else {
        toast({ variant: "destructive", title: "Registration Failed", description: error.message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Super Admin Login</CardTitle>
          <CardDescription>
            Access the University Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50"
              onClick={handleRegister}
              disabled={isLoading}
            >
              Fix / Create Admin Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Demo Credentials:</p>
            <p className="font-mono text-xs mt-1">
              Email: admin@perl.com<br />
              Password: password123
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
