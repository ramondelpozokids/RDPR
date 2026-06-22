import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { createExpenseIssueEntry, createExpensePaymentEntry } from "@/lib/accounting/journal"

const expenseSchema = z.object({
  description: z.string().min(1),
  vendor: z.string().optional(),
  vendorTaxId: z.string().optional(),
  category: z.enum(["SERVICES", "SUPPLIES", "BANK_FEES", "RENT", "OTHER"]).default("SERVICES"),
  issueDate: z.string().optional(),
  status: z.enum(["PENDING", "PAID"]).default("PENDING"),
  subtotal: z.number().positive(),
  taxRate: z.number().min(0).max(100).default(21),
  withholdingRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const expenses = await prisma.expense.findMany({
    where: { companyId },
    orderBy: { issueDate: "desc" },
  })

  return NextResponse.json({ success: true, data: expenses })
}

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = expenseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { description, vendor, vendorTaxId, category, issueDate, status, subtotal, taxRate, withholdingRate, notes } = parsed.data
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  const paidAt = status === "PAID" ? new Date() : null
  const whRate = category === "RENT" ? withholdingRate ?? 19 : withholdingRate
  const withholdingAmount =
    whRate != null && whRate > 0 ? subtotal * (whRate / 100) : category === "RENT" ? subtotal * 0.19 : null

  const expense = await prisma.expense.create({
    data: {
      companyId,
      description,
      vendor: vendor || null,
      vendorTaxId: vendorTaxId || null,
      category,
      status,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      paidAt,
      subtotal,
      taxRate,
      taxAmount,
      total,
      withholdingRate: whRate ?? null,
      withholdingAmount,
      notes,
    },
  })

  await createExpenseIssueEntry(expense)

  return NextResponse.json({ success: true, data: expense }, { status: 201 })
}
