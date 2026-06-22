import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const accounts = await prisma.bankAccount.findMany({
    where: { companyId },
    include: { _count: { select: { transactions: true } } },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ success: true, data: accounts })
}

const createSchema = z.object({
  name: z.string().min(1),
  iban: z.string().optional(),
  bankName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const account = await prisma.bankAccount.create({
    data: { companyId, ...parsed.data },
  })

  return NextResponse.json({ success: true, data: account })
}
