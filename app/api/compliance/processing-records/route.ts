import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await prisma.dataProcessingRecord.findMany({
    where: { companyId },
    orderBy: { updatedAt: "desc" },
    include: { customer: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ data })
}

const postSchema = z.object({
  activity: z.string().min(1),
  purpose: z.string().min(1),
  legalBasis: z.string().min(1),
  dataCategories: z.array(z.string()).optional(),
  recipients: z.string().optional(),
  retention: z.string().min(1),
  securityMeasures: z.string().optional(),
  customerId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const record = await prisma.dataProcessingRecord.create({
    data: { companyId, ...parsed.data },
    include: { customer: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ data: record })
}
