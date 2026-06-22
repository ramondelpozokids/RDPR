import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  nif: z.string().min(1).optional(),
  contractType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  baseSalary: z.number().positive().optional(),
  active: z.boolean().optional(),
})

type Props = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.employee.findFirst({ where: { id: params.id, companyId } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const d = parsed.data
  const employee = await prisma.employee.update({
    where: { id: params.id },
    data: {
      ...(d.firstName != null && { firstName: d.firstName }),
      ...(d.lastName != null && { lastName: d.lastName }),
      ...(d.nif != null && { nif: d.nif }),
      ...(d.contractType != null && { contractType: d.contractType }),
      ...(d.startDate != null && { startDate: new Date(d.startDate) }),
      ...(d.endDate !== undefined && { endDate: d.endDate ? new Date(d.endDate) : null }),
      ...(d.baseSalary != null && { baseSalary: d.baseSalary }),
      ...(d.active != null && { active: d.active }),
    },
  })

  return NextResponse.json({ success: true, data: employee })
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const existing = await prisma.employee.findFirst({ where: { id: params.id, companyId } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.employee.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
