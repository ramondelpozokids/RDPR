// app/api/invoices/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { getActiveBrandId } from "@/lib/brands/context"
import { syncOverdueInvoices, initialInvoiceStatus } from "@/lib/invoices/sync-overdue"
import { createInvoiceIssueEntry } from "@/lib/accounting/journal"

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity:    z.number().positive(),
  unitPrice:   z.number().nonnegative(),
})

const invoiceSchema = z.object({
  customerId: z.string(),
  dueDate:    z.string().optional(),
  notes:      z.string().optional(),
  taxRate:    z.number().default(21),
  withholdingRate: z.number().min(0).max(100).optional(),
  items:      z.array(invoiceItemSchema).min(1),
})

async function nextInvoiceNumber(companyId: string): Promise<string> {
  const count = await prisma.invoice.count({ where: { companyId } })
  const year  = new Date().getFullYear()
  return `FAC-${year}-${String(count + 1).padStart(4, "0")}`
}

// GET /api/invoices
export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await syncOverdueInvoices(companyId)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId,
      ...(status && { status: status as any }),
    },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ success: true, data: invoices })
}

// POST /api/invoices
export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const parsed = invoiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { customerId, dueDate, notes, taxRate, withholdingRate, items } = parsed.data

  const subtotal  = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const withholdingAmount =
    withholdingRate && withholdingRate > 0 ? subtotal * (withholdingRate / 100) : null
  const total     = subtotal + taxAmount - (withholdingAmount ?? 0)
  const number    = await nextInvoiceNumber(companyId)

  const [company, customer] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId }, select: { taxId: true } }),
    prisma.customer.findFirst({ where: { id: customerId, companyId }, select: { taxId: true } }),
  ])

  const { generateComplianceHash } = await import("@/lib/efactura/compliance-hash")
  const complianceHash = generateComplianceHash({
    number,
    issueDate: new Date(),
    total,
    taxId: company?.taxId,
    customerTaxId: customer?.taxId,
  })

  const due = dueDate ? new Date(dueDate) : null
  const status = initialInvoiceStatus(due)
  const brandId = await getActiveBrandId(companyId)

  const invoice = await prisma.invoice.create({
    data: {
      companyId,
      brandId,
      customerId,
      number,
      status,
      taxRate,
      subtotal,
      taxAmount,
      withholdingRate: withholdingRate && withholdingRate > 0 ? withholdingRate : null,
      withholdingAmount,
      total,
      dueDate:  due,
      notes,
      complianceHash,
      electronicFormat: "FACTURAE_3_2",
      electronicStatus: "ISSUED",
      items: {
        create: items.map((item) => ({
          description: item.description,
          quantity:    item.quantity,
          unitPrice:   item.unitPrice,
          total:       item.quantity * item.unitPrice,
        })),
      },
    },
    include: { customer: true, items: true },
  })

  await createInvoiceIssueEntry(invoice)

  return NextResponse.json({ success: true, data: invoice }, { status: 201 })
}
