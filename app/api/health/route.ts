import { NextResponse } from "next/server"
import { resolveAuthBaseUrl } from "@/lib/auth/resolve-url"

export const runtime = "nodejs"

export async function GET() {
  const db = process.env.DATABASE_URL ?? ""
  return NextResponse.json({
    ok: true,
    authUrl: resolveAuthBaseUrl(),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
    hasDatabase: db.length > 0,
    databaseOk: db.length > 0 && !db.includes("example.com"),
    vercel: Boolean(process.env.VERCEL),
  })
}
