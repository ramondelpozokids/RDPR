import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireCompanyId } from "@/lib/company/context"
import { askIntelligence, PREDEFINED_QUERIES, type IntelligenceQueryId } from "@/lib/intelligence/queries"

const bodySchema = z.object({
  queryId: z
    .enum([
      "billed_month",
      "paid_month",
      "pending_invoices",
      "overdue_invoices",
      "active_projects",
      "customers_summary",
      "vat_quarter",
      "top_customers",
      "expenses_month",
      "cashflow_forecast",
      "accounting_alerts",
      "ledger_balance",
      "payroll_cost_month",
      "payroll_employees",
    ] as [IntelligenceQueryId, ...IntelligenceQueryId[]])
    .optional(),
  message: z.string().max(500).optional(),
})

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      queries: PREDEFINED_QUERIES,
      version: "v0",
    },
  })
}

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  if (!parsed.data.queryId && !parsed.data.message?.trim()) {
    return NextResponse.json({ error: "Indica una pregunta o queryId" }, { status: 400 })
  }

  const result = await askIntelligence(companyId, parsed.data)

  if ("error" in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: 422 })
  }

  return NextResponse.json({ success: true, data: result })
}
