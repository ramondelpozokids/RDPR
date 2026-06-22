import { NextRequest, NextResponse } from "next/server"
import { requireCompanyId } from "@/lib/company/context"
import { generateFinanceExport, type ExportType } from "@/lib/accounting/export-csv"

const VALID_TYPES: ExportType[] = ["journal", "accounts", "ledger", "ledgers", "vat"]

export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") as ExportType | null
  const accountCode = searchParams.get("accountCode") ?? undefined

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo de exportación inválido" }, { status: 400 })
  }

  const result = await generateFinanceExport(companyId, type, accountCode)
  if (!result) {
    return NextResponse.json({ error: "No se pudo generar la exportación" }, { status: 404 })
  }

  return new NextResponse(result.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
    },
  })
}
