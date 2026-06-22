import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { parseBankCsv } from "@/lib/banking/import-csv"
import { randomUUID } from "crypto"

const importSchema = z.object({
  bankAccountId: z.string(),
  csv: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = importSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const account = await prisma.bankAccount.findFirst({
    where: { id: parsed.data.bankAccountId, companyId },
  })
  if (!account) return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })

  const rows = parseBankCsv(parsed.data.csv)
  if (rows.length === 0) {
    return NextResponse.json({ error: "No se encontraron movimientos válidos en el CSV" }, { status: 400 })
  }

  const batchId = randomUUID()
  const created = await prisma.bankTransaction.createMany({
    data: rows.map((r) => ({
      companyId,
      bankAccountId: account.id,
      date: r.date,
      description: r.description,
      amount: r.amount,
      reference: r.reference ?? null,
      importBatchId: batchId,
      status: "UNMATCHED" as const,
    })),
  })

  return NextResponse.json({
    success: true,
    data: { imported: created.count, batchId },
  })
}
