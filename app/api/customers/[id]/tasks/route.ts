import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["GENERAL", "DOCUMENT_REQUEST", "TAX_FILING", "REVIEW", "FOLLOW_UP"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
})

async function assertCustomer(companyId: string, customerId: string) {
  return prisma.customer.findFirst({ where: { id: customerId, companyId } })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await assertCustomer(companyId, params.id)
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const tasks = await prisma.customerTask.findMany({
    where: { companyId, customerId: params.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: { assignee: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ success: true, data: tasks })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await assertCustomer(companyId, params.id)
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body = await req.json()
  const parsed = taskSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { dueDate, ...rest } = parsed.data
  const task = await prisma.customerTask.create({
    data: {
      companyId,
      customerId: params.id,
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ success: true, data: task }, { status: 201 })
}
