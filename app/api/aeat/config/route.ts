import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const patchSchema = z.object({
  softwareName: z.string().min(1).optional(),
  softwareVersion: z.string().min(1).optional(),
  mode: z.enum(["test", "prod"]).optional(),
  certificateRef: z.string().optional().nullable(),
})

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const config = await prisma.companyVerifactuConfig.findUnique({ where: { companyId } })
  return NextResponse.json({
    data: config ?? {
      mode: process.env.AEAT_VERIFACTU_MODE ?? "test",
      softwareName: "RDPR OS",
      softwareVersion: "1.0",
      certificateRef: process.env.AEAT_CERTIFICATE_REF ?? null,
    },
  })
}

export async function PATCH(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const config = await prisma.companyVerifactuConfig.upsert({
    where: { companyId },
    create: { companyId, ...parsed.data },
    update: parsed.data,
  })

  return NextResponse.json({ data: config })
}
