import { NextResponse } from "next/server"
import { resolveAuthBaseUrl } from "@/lib/auth/resolve-url"
import { prisma } from "@/lib/prisma/client"

export const runtime = "nodejs"

export async function GET() {
  const db = process.env.DATABASE_URL ?? ""
  let dbConnected = false
  let userFound = false
  let dbError: string | undefined

  try {
    const user = await prisma.user.findUnique({
      where: { email: "info@ramondelpozorott.es" },
      select: { id: true },
    })
    dbConnected = true
    userFound = Boolean(user)
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Error de conexión"
  }

  return NextResponse.json({
    ok: dbConnected && userFound,
    authUrl: resolveAuthBaseUrl(),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
    hasDatabase: db.length > 0,
    databaseOk: db.length > 0 && !db.includes("example.com"),
    dbConnected,
    userFound,
    dbError,
    vercel: Boolean(process.env.VERCEL),
  })
}
