import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { currentPayrollPeriod, parsePayrollPeriod } from "@/lib/payroll/payslip-pdf"

const runSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const runs = await prisma.payrollRun.findMany({
    where: { companyId },
    orderBy: { period: "desc" },
    include: {
      lines: {
        include: { employee: { select: { firstName: true, lastName: true } } },
      },
    },
  })

  return NextResponse.json({ success: true, data: runs })
}

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = runSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const period = parsed.data.period ?? currentPayrollPeriod()
  if (!parsePayrollPeriod(period)) {
    return NextResponse.json({ error: "Periodo inválido (YYYY-MM)" }, { status: 400 })
  }

  const existing = await prisma.payrollRun.findUnique({
    where: { companyId_period: { companyId, period } },
  })
  if (existing) {
    return NextResponse.json({ error: "Ya existe nómina para este periodo" }, { status: 409 })
  }

  const bounds = parsePayrollPeriod(period)!
  const employees = await prisma.employee.findMany({
    where: {
      companyId,
      active: true,
      startDate: { lte: bounds.end },
      OR: [{ endDate: null }, { endDate: { gte: bounds.start } }],
    },
  })

  const run = await prisma.payrollRun.create({
    data: {
      companyId,
      period,
      notes: parsed.data.notes,
      lines: {
        create: employees.map((e) => ({
          employeeId: e.id,
          gross: e.baseSalary,
          deductions: 0,
          net: e.baseSalary,
        })),
      },
    },
    include: {
      lines: { include: { employee: true } },
    },
  })

  return NextResponse.json({ success: true, data: run }, { status: 201 })
}
