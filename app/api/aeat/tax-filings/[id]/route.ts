import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const filing = await prisma.aeatTaxFiling.findFirst({
    where: { id: params.id, companyId },
  })
  if (!filing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  return NextResponse.json({ data: filing })
}
