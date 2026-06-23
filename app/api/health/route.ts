import { NextResponse } from "next/server"
import { getAuthDiagnostics } from "@/lib/auth/env"
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
    ...getAuthDiagnostics(),
    dbConnected,
    userFound,
    dbError,
    vercel: Boolean(process.env.VERCEL),
  })
}
