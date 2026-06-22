// app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { auth }   from "@/lib/auth/config"

async function getCompanyId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const uc = await prisma.userCompany.findFirst({
    where: { userId: session.user.id as string },
    select: { companyId: true },
  })
  return uc?.companyId ?? null
}

// GET /api/invoices/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await getCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const invoice = await prisma.invoice.findFirst({
    where:   { id: params.id, companyId },
    include: { customer: true, items: true },
  })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  return NextResponse.json({ success: true, data: invoice })
}

// PATCH /api/invoices/:id  — cambiar estado
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await getCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const schema = z.object({
    status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const invoice = await prisma.invoice.findFirst({ where: { id: params.id, companyId } })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.status === "PAID" && !invoice.paidAt ? { paidAt: new Date() } : {}),
    },
    include: { customer: true, items: true },
  })

  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/invoices/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await getCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const invoice = await prisma.invoice.findFirst({ where: { id: params.id, companyId } })
  if (!invoice) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  await prisma.invoice.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
