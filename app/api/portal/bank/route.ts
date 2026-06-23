import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requirePortalContext } from "@/lib/portal/context"
import { markChecklistDone } from "@/lib/crm/checklist-sync"
import { assertFeature } from "@/lib/billing/usage"
import { PlanLimitError } from "@/lib/billing/plan-limits"

const bankSchema = z.object({
  iban: z.string().min(15).max(34),
  bankName: z.string().optional(),
})

export async function GET() {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const connection = await prisma.customerBankConnection.findFirst({
    where: { companyId: ctx.companyId, customerId: ctx.customerId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ success: true, data: connection })
}

export async function POST(req: NextRequest) {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = bankSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "IBAN inválido" }, { status: 400 })

  try {
    await assertFeature(ctx.companyId, "openBanking")
  } catch (e) {
    if (e instanceof PlanLimitError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 402 })
    }
    throw e
  }

  const iban = parsed.data.iban.replace(/\s/g, "").toUpperCase()
  const existing = await prisma.customerBankConnection.findFirst({
    where: { companyId: ctx.companyId, customerId: ctx.customerId },
  })

  const connection = existing
    ? await prisma.customerBankConnection.update({
        where: { id: existing.id },
        data: {
          iban,
          bankName: parsed.data.bankName,
          status: "CONNECTED",
          lastSyncAt: new Date(),
        },
      })
    : await prisma.customerBankConnection.create({
        data: {
          companyId: ctx.companyId,
          customerId: ctx.customerId,
          iban,
          bankName: parsed.data.bankName,
          provider: "manual",
          status: "CONNECTED",
          lastSyncAt: new Date(),
        },
      })

  await markChecklistDone(ctx.customerId, "bank")

  return NextResponse.json({ success: true, data: connection })
}
