import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const drafts = await prisma.expenseDraft.findMany({
    where: { companyId, status: "PENDING_REVIEW" },
    include: {
      document: { select: { id: true, name: true, fileUrl: true, customerId: true } },
      customer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ success: true, data: drafts })
}
