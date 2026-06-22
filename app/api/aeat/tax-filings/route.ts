import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { submitAeatTaxFiling } from "@/lib/aeat/tax-filing"
import { V1_TAX_MODEL_IDS } from "@/lib/tax/models-registry"

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const [filings, registry] = await Promise.all([
    prisma.aeatTaxFiling.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.verifactuRegistryEntry.findMany({
      where: { companyId },
      orderBy: { submittedAt: "desc" },
      take: 30,
      include: { invoice: { select: { number: true, total: true } } },
    }),
  ])

  return NextResponse.json({ data: { filings, registry } })
}

const postSchema = z.object({
  modelId: z.string(),
  year: z.number().int().min(2020).max(2100),
  quarter: z.number().int().min(1).max(4).optional(),
  month: z.number().int().min(1).max(12).optional(),
})

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  if (!V1_TAX_MODEL_IDS.includes(parsed.data.modelId)) {
    return NextResponse.json({ error: "Modelo no disponible para presentación v1" }, { status: 400 })
  }

  try {
    const result = await submitAeatTaxFiling(companyId, parsed.data.modelId, {
      year: parsed.data.year,
      quarter: parsed.data.quarter,
      month: parsed.data.month,
    })
    return NextResponse.json({ data: result.filing, aeat: result.aeat })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al presentar modelo" },
      { status: 400 }
    )
  }
}
