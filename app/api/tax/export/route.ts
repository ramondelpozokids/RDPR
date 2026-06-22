import { NextRequest, NextResponse } from "next/server"
import { requireCompanyId } from "@/lib/company/context"
import { exportTaxModelCsv } from "@/lib/tax/export"
import { V1_TAX_MODEL_IDS } from "@/lib/tax/models-registry"

export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const model = searchParams.get("model")
  const period = searchParams.get("period") ?? undefined

  if (!model || !V1_TAX_MODEL_IDS.includes(model)) {
    return NextResponse.json({ error: "Modelo fiscal inválido" }, { status: 400 })
  }

  const result = await exportTaxModelCsv(companyId, model, period)
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
