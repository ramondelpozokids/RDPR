import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireCompanyId } from "@/lib/company/context"
import { matchTransaction } from "@/lib/banking/reconcile"

const matchSchema = z.object({
  invoiceId: z.string().optional(),
  expenseId: z.string().optional(),
  ignore: z.boolean().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = matchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  try {
    const tx = await matchTransaction(companyId, params.id, parsed.data)
    return NextResponse.json({ success: true, data: tx })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al conciliar"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
