// lib/auth/config.ts — runtime Node (API routes, layouts, server actions)
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/lib/auth/auth.config"
import { authorizeCredentials } from "@/lib/auth/authorize-credentials"
import { ensureAuthEnv } from "@/lib/auth/env"

ensureAuthEnv()

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        return authorizeCredentials(credentials?.email, credentials?.password)
      },
    }),
  ],
})
