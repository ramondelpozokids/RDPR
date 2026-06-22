import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const caseSchema = z.object({
  title: z.string().min(1),
  customerId: z.string().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const cases = await prisma.legalCase.findMany({
    where: { companyId },
    orderBy: { updatedAt: "desc" },
    include: {
      customer: { select: { name: true } },
      _count: { select: { documents: true } },
    },
  })

  return NextResponse.json({ success: true, data: cases })
}

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = caseSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const legalCase = await prisma.legalCase.create({
    data: {
      companyId,
      title: parsed.data.title,
      customerId: parsed.data.customerId || null,
      status: parsed.data.status ?? "OPEN",
      notes: parsed.data.notes,
    },
  })

  return NextResponse.json({ success: true, data: legalCase }, { status: 201 })
}
