import { NextResponse } from "next/server"
import { requireCompanyId } from "@/lib/company/context"
import { getFirmUsage } from "@/lib/billing/usage"
import { isVisionConfigured } from "@/lib/documents/ocr-vision"

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const usage = await getFirmUsage(companyId)
  if (!usage) return NextResponse.json({ error: "Gestoría no encontrada" }, { status: 404 })

  return NextResponse.json({
    success: true,
    data: {
      ...usage,
      visionEnabled: isVisionConfigured(),
    },
  })
}
