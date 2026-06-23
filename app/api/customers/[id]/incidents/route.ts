import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const incidentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
})

async function assertCustomer(companyId: string, customerId: string) {
  return prisma.customer.findFirst({ where: { id: customerId, companyId } })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await assertCustomer(companyId, params.id)
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const incidents = await prisma.customerIncident.findMany({
    where: { companyId, customerId: params.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ success: true, data: incidents })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await assertCustomer(companyId, params.id)
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body = await req.json()
  const parsed = incidentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const incident = await prisma.customerIncident.create({
    data: { companyId, customerId: params.id, ...parsed.data },
  })

  return NextResponse.json({ success: true, data: incident }, { status: 201 })
}
