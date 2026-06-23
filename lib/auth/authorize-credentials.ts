import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma/client"

export type AuthorizedUser = {
  id: string
  email: string
  name: string | null
  image: string | null
}

/** Valida email + contraseña contra la base de datos. Usado solo en runtime Node. */
export async function authorizeCredentials(
  emailRaw: unknown,
  passwordRaw: unknown
): Promise<AuthorizedUser | null> {
  if (typeof emailRaw !== "string" || typeof passwordRaw !== "string") return null

  const email = emailRaw.trim().toLowerCase()
  const password = passwordRaw

  if (!email || !password) return null

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user?.passwordHash) return null

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.avatarUrl,
  }
}
