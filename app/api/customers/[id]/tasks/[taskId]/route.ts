import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["GENERAL", "DOCUMENT_REQUEST", "TAX_FILING", "REVIEW", "FOLLOW_UP"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const task = await prisma.customerTask.findFirst({
    where: { id: params.taskId, companyId, customerId: params.id },
  })
  if (!task) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { dueDate, status, ...rest } = parsed.data
  const updated = await prisma.customerTask.update({
    where: { id: params.taskId },
    data: {
      ...rest,
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(status === "DONE" && !task.completedAt ? { completedAt: new Date() } : {}),
      ...(status && status !== "DONE" ? { completedAt: null } : {}),
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const task = await prisma.customerTask.findFirst({
    where: { id: params.taskId, companyId, customerId: params.id },
  })
  if (!task) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.customerTask.delete({ where: { id: params.taskId } })
  return NextResponse.json({ success: true })
}
