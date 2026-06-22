import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { generatePayslipPdf } from "@/lib/payroll/payslip-pdf"

type Props = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const run = await prisma.payrollRun.findFirst({
    where: { id: params.id, companyId },
    include: {
      lines: { include: { employee: true } },
      company: { select: { name: true } },
    },
  })
  if (!run) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const lineId = searchParams.get("lineId")

  if (lineId) {
    const line = run.lines.find((l) => l.id === lineId)
    if (!line) return NextResponse.json({ error: "Línea no encontrada" }, { status: 404 })

    const pdf = generatePayslipPdf({
      period: run.period,
      companyName: run.company.name,
      employeeName: `${line.employee.firstName} ${line.employee.lastName}`,
      nif: line.employee.nif,
      gross: line.gross,
      deductions: line.deductions,
      net: line.net,
    })

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="nomina-${run.period}-${line.employee.nif}.pdf"`,
      },
    })
  }

  return NextResponse.json({ success: true, data: run })
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const run = await prisma.payrollRun.findFirst({ where: { id: params.id, companyId } })
  if (!run) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body = await req.json()
  if (body.status === "CONFIRMED" || body.status === "PAID" || body.status === "DRAFT") {
    const updated = await prisma.payrollRun.update({
      where: { id: params.id },
      data: { status: body.status },
      include: { lines: { include: { employee: true } } },
    })
    return NextResponse.json({ success: true, data: updated })
  }

  if (Array.isArray(body.lines)) {
    for (const line of body.lines) {
      if (!line.id) continue
      const gross = Number(line.gross) || 0
      const deductions = Number(line.deductions) || 0
      await prisma.payrollLine.update({
        where: { id: line.id },
        data: { gross, deductions, net: gross - deductions },
      })
    }
    const updated = await prisma.payrollRun.findFirst({
      where: { id: params.id },
      include: { lines: { include: { employee: true } } },
    })
    return NextResponse.json({ success: true, data: updated })
  }

  return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
}
