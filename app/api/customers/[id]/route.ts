// app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await prisma.customer.findFirst({
    where:   { id: params.id, companyId },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" }, include: { items: true } },
    },
  })
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  return NextResponse.json({ success: true, data: customer })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const schema = z.object({
    name:          z.string().min(1).optional(),
    email:         z.string().email().optional().or(z.literal("")),
    phone:         z.string().optional(),
    address:       z.string().optional(),
    city:          z.string().optional(),
    taxId:         z.string().optional(),
    notes:         z.string().optional(),
    pipelineStage: z.enum(["NEW_CONTACT","QUOTE_SENT","CLIENT_WON","CLIENT_LOST"]).optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const customer = await prisma.customer.findFirst({ where: { id: params.id, companyId } })
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const updated = await prisma.customer.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await prisma.customer.findFirst({ where: { id: params.id, companyId } })
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.customer.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
