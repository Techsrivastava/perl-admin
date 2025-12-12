// Extend NextAuth types
declare module "next-auth" {
  interface User {
    role: string
    token: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    accessToken: string
  }
}

import NextAuth, { NextAuthOptions, Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Create AbortController for timeout handling
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          // Call backend API for authentication
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://perl-backend-env.up.railway.app/'
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            console.error(`Auth failed: ${response.status}`)
            return null
          }

          const data = await response.json()

          if (data.success && data.data?.token) {
            // Create new AbortController for the second request
            const controller2 = new AbortController()
            const timeoutId2 = setTimeout(() => controller2.abort(), 10000)

            // Get user details
            const userResponse = await fetch(`${backendUrl}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${data.data.token}`,
              },
              signal: controller2.signal,
            })

            clearTimeout(timeoutId2)

            if (userResponse.ok) {
              const userData = await userResponse.json()
              return {
                id: userData.data._id,
                email: userData.data.email,
                name: userData.data.name,
                role: userData.data.role,
                token: data.data.token,
              }
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | null }): Promise<JWT> {
      if (user) {
        token.role = user.role
        token.accessToken = user.token
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.accessToken = token.accessToken
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }
