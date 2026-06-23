import type { NextAuthConfig } from "next-auth"
import { ensureAuthEnv, getAuthSecret } from "@/lib/auth/env"

ensureAuthEnv()

/** Config compatible con Edge (middleware). Sin Prisma ni providers con DB. */
export const authConfig = {
  secret: getAuthSecret(),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname
      const protectedRoute =
        path.startsWith("/dashboard") || path.startsWith("/portal")

      if (!protectedRoute) return true
      return !!auth?.user
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
