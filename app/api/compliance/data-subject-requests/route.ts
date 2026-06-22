import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await prisma.dataSubjectRequest.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ data })
}

const postSchema = z.object({
  type: z.enum(["ACCESS", "ERASURE", "PORTABILITY", "RECTIFICATION"]),
  requesterName: z.string().min(1),
  requesterEmail: z.string().email(),
  notes: z.string().optional(),
  customerId: z.string().optional(),
})

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
})

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const record = await prisma.dataSubjectRequest.create({
    data: { companyId, ...parsed.data },
  })

  return NextResponse.json({ data: record })
}

export async function PATCH(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const existing = await prisma.dataSubjectRequest.findFirst({
    where: { id: parsed.data.id, companyId },
  })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const updated = await prisma.dataSubjectRequest.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      resolvedAt: parsed.data.status === "CLOSED" ? new Date() : null,
    },
  })

  return NextResponse.json({ data: updated })
}
