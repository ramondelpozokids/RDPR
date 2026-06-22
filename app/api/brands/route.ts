import { NextResponse } from "next/server"
import { requireCompanyId } from "@/lib/company/context"
import { getCompanyBrands } from "@/lib/brands/context"

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const brands = await getCompanyBrands(companyId)
  return NextResponse.json({ success: true, data: brands })
}
