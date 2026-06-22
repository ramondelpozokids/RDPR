import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const patchSchema = z.object({
  status: z.enum(["SIGNED", "REJECTED", "CANCELLED", "EXPIRED"]).optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const request = await prisma.signatureRequest.findFirst({
    where: { id: params.id, companyId },
    include: {
      document: true,
      customer: true,
      legalCase: true,
    },
  })
  if (!request) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  return NextResponse.json({ data: request })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const existing = await prisma.signatureRequest.findFirst({
    where: { id: params.id, companyId },
  })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (parsed.data.status) {
    data.status = parsed.data.status
    if (parsed.data.status === "SIGNED") data.signedAt = new Date()
  }

  const updated = await prisma.signatureRequest.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json({ data: updated })
}
