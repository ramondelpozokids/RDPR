import { prisma } from "@/lib/prisma/client"
import { getFirmForCompany } from "@/lib/firm/ensure"
import { getPlanLimits, PlanLimitError, type PlanId } from "@/lib/billing/plan-limits"

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export type FirmUsage = {
  planId: PlanId
  planName: string
  clients: number
  users: number
  ocrThisMonth: number
  signaturesThisMonth: number
  limits: ReturnType<typeof getPlanLimits>
}

export async function getFirmUsage(companyId: string): Promise<FirmUsage | null> {
  const firm = await getFirmForCompany(companyId)
  if (!firm) return null

  const companyIds = await prisma.company.findMany({
    where: { firmId: firm.id },
    select: { id: true },
  })
  const ids = companyIds.map((c) => c.id)
  if (!ids.length) ids.push(companyId)

  const start = monthStart()

  const [clients, users, ocrThisMonth, signaturesThisMonth] = await Promise.all([
    prisma.customer.count({ where: { companyId: { in: ids } } }),
    prisma.userCompany.count({ where: { companyId: { in: ids } } }),
    prisma.ocrJob.count({
      where: {
        companyId: { in: ids },
        createdAt: { gte: start },
        status: { in: ["COMPLETED", "PROCESSING"] },
      },
    }),
    prisma.signatureRequest.count({
      where: {
        companyId: { in: ids },
        createdAt: { gte: start },
      },
    }),
  ])

  const limits = getPlanLimits(firm.billingPlan)

  return {
    planId: limits.id,
    planName: limits.name,
    clients,
    users,
    ocrThisMonth,
    signaturesThisMonth,
    limits,
  }
}

export async function assertCanAddClient(companyId: string) {
  const usage = await getFirmUsage(companyId)
  if (!usage) return
  if (usage.clients >= usage.limits.maxClients) {
    throw new PlanLimitError(
      "CLIENTS",
      `Límite de clientes alcanzado (${usage.limits.maxClients}). Actualiza tu plan en Ajustes.`
    )
  }
}

export async function assertCanRunOcr(companyId: string) {
  const usage = await getFirmUsage(companyId)
  if (!usage) return
  if (usage.ocrThisMonth >= usage.limits.maxOcrPerMonth) {
    throw new PlanLimitError(
      "OCR",
      `Límite mensual de OCR alcanzado (${usage.limits.maxOcrPerMonth}). Actualiza tu plan.`
    )
  }
}

export async function assertCanCreateSignature(companyId: string) {
  const usage = await getFirmUsage(companyId)
  if (!usage) return
  if (usage.signaturesThisMonth >= usage.limits.maxSignaturesPerMonth) {
    throw new PlanLimitError(
      "SIGNATURES",
      `Límite mensual de firmas alcanzado (${usage.limits.maxSignaturesPerMonth}).`
    )
  }
}

export async function assertFeature(companyId: string, feature: "openBanking" | "intelligence") {
  const firm = await getFirmForCompany(companyId)
  if (!firm) return
  const limits = getPlanLimits(firm.billingPlan)
  if (feature === "openBanking" && !limits.openBanking) {
    throw new PlanLimitError("FEATURE", "Open Banking requiere plan Professional o superior.")
  }
  if (feature === "intelligence" && !limits.intelligence) {
    throw new PlanLimitError("FEATURE", "RDPR Intelligence requiere plan Professional o superior.")
  }
}
