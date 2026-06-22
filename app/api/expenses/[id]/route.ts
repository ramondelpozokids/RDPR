import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { createExpensePaymentEntry } from "@/lib/accounting/journal"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const schema = z.object({
    status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const expense = await prisma.expense.findFirst({ where: { id: params.id, companyId } })
  if (!expense) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const updated = await prisma.expense.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.status === "PAID" && !expense.paidAt ? { paidAt: new Date() } : {}),
    },
  })

  if (parsed.data.status === "PAID") {
    await createExpensePaymentEntry(updated)
  }

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const expense = await prisma.expense.findFirst({ where: { id: params.id, companyId } })
  if (!expense) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.expense.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  })

  return NextResponse.json({ success: true })
}
