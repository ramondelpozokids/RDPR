// app/api/companies/switch/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth/config"
import {
  COMPANY_COOKIE,
  userHasCompanyAccess,
} from "@/lib/company/context"

const bodySchema = z.object({
  companyId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { companyId } = parsed.data
  const userId = session.user.id as string

  const allowed = await userHasCompanyAccess(userId, companyId)
  if (!allowed) {
    return NextResponse.json({ error: "Sin acceso a esta empresa" }, { status: 403 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(COMPANY_COOKIE, companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
