import type { NextAuthConfig } from "next-auth"
import { ensureAuthEnv } from "@/lib/auth/resolve-url"

ensureAuthEnv()

/** Config Edge-safe (middleware). Sin Prisma ni providers con DB. */
export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
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
