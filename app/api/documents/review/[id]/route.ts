import { NextResponse } from "next/server"
import { requireCompanyId } from "@/lib/company/context"
import { approveExpenseDraft, rejectExpenseDraft } from "@/lib/documents/expense-draft"

type Props = { params: { id: string } }

export async function POST(req: Request, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { action } = await req.json().catch(() => ({}))
  if (action === "reject") {
    await rejectExpenseDraft(params.id, companyId)
    return NextResponse.json({ success: true, status: "REJECTED" })
  }

  const expense = await approveExpenseDraft(params.id, companyId)
  if (!expense) return NextResponse.json({ error: "Borrador no encontrado" }, { status: 404 })

  return NextResponse.json({ success: true, data: expense })
}
