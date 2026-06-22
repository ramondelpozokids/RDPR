import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nif: z.string().min(1),
  contractType: z.string().default("INDEFINIDO"),
  startDate: z.string(),
  endDate: z.string().optional(),
  baseSalary: z.number().positive(),
  customerId: z.string().optional(),
  active: z.boolean().default(true),
})

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const employees = await prisma.employee.findMany({
    where: { companyId },
    orderBy: [{ active: "desc" }, { lastName: "asc" }],
    include: { customer: { select: { name: true } } },
  })

  return NextResponse.json({ success: true, data: employees })
}

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = employeeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const employee = await prisma.employee.create({
    data: {
      companyId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      nif: parsed.data.nif,
      contractType: parsed.data.contractType,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      baseSalary: parsed.data.baseSalary,
      customerId: parsed.data.customerId || null,
      active: parsed.data.active,
    },
  })

  return NextResponse.json({ success: true, data: employee }, { status: 201 })
}
