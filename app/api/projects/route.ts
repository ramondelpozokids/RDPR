// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const projectSchema = z.object({
  customerId:  z.string().optional(),
  name:        z.string().min(1),
  description: z.string().optional(),
  status:      z.enum(["PENDING","IN_PROGRESS","COMPLETED","CANCELLED"]).optional(),
  startDate:   z.string().optional(),
  endDate:     z.string().optional(),
})

export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const projects = await prisma.project.findMany({
    where:   { companyId },
    include: { customer: true, tasks: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ success: true, data: projects })
}

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const project = await prisma.project.create({
    data: {
      companyId,
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate:   parsed.data.endDate   ? new Date(parsed.data.endDate)   : null,
    },
    include: { customer: true },
  })

  return NextResponse.json({ success: true, data: project }, { status: 201 })
}
