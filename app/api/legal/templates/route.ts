import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const templateSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  body: z.string().min(1),
})

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const templates = await prisma.legalTemplate.findMany({
    where: { companyId },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ success: true, data: templates })
}

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = templateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const template = await prisma.legalTemplate.create({
    data: { companyId, ...parsed.data },
  })

  return NextResponse.json({ success: true, data: template }, { status: 201 })
}
