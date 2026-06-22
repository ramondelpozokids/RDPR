import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const bankAccountId = searchParams.get("bankAccountId") ?? undefined
  const status = searchParams.get("status") ?? undefined

  const transactions = await prisma.bankTransaction.findMany({
    where: {
      companyId,
      ...(bankAccountId ? { bankAccountId } : {}),
      ...(status ? { status: status as "UNMATCHED" | "MATCHED" | "IGNORED" } : {}),
    },
    include: { bankAccount: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 200,
  })

  return NextResponse.json({ success: true, data: transactions })
}
