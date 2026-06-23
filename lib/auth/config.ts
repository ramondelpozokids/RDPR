// lib/auth/config.ts — runtime Node (API routes, layouts, authorize)
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma/client"
import { authConfig } from "@/lib/auth/auth.config"
import { ensureAuthEnv } from "@/lib/auth/resolve-url"

ensureAuthEnv()

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).trim().toLowerCase()

        const user = await prisma.user.findUnique({
          where: { email },
        })
        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.avatarUrl }
      },
    }),
  ],
})
