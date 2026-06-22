import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth/config"
import { getActiveCompanyId } from "@/lib/company/context"
import { BRAND_COOKIE, userBrandBelongsToCompany } from "@/lib/brands/context"

const bodySchema = z.object({ brandId: z.string().min(1) })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const companyId = await getActiveCompanyId(session.user.id as string)
  if (!companyId) {
    return NextResponse.json({ error: "Sin empresa activa" }, { status: 403 })
  }

  const allowed = await userBrandBelongsToCompany(parsed.data.brandId, companyId)
  if (!allowed) {
    return NextResponse.json({ error: "Marca no disponible" }, { status: 403 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(BRAND_COOKIE, parsed.data.brandId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
