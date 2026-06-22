import { NextResponse } from "next/server"
import { requireCompanyId } from "@/lib/company/context"
import { getMatchSuggestions } from "@/lib/banking/reconcile"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const suggestions = await getMatchSuggestions(companyId, params.id)
  return NextResponse.json({ success: true, data: suggestions })
}
