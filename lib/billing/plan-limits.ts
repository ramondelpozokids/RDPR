/** Límites por plan SaaS gestoría (Product Blueprint). */
export type PlanId = "trial" | "starter" | "professional" | "business" | "enterprise" | "intelligence"

export type PlanLimits = {
  id: PlanId
  name: string
  maxClients: number
  maxUsers: number
  maxOcrPerMonth: number
  maxSignaturesPerMonth: number
  openBanking: boolean
  intelligence: boolean
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  trial: {
    id: "trial",
    name: "Prueba",
    maxClients: 5,
    maxUsers: 2,
    maxOcrPerMonth: 20,
    maxSignaturesPerMonth: 3,
    openBanking: false,
    intelligence: true,
  },
  starter: {
    id: "starter",
    name: "Starter",
    maxClients: 25,
    maxUsers: 2,
    maxOcrPerMonth: 100,
    maxSignaturesPerMonth: 5,
    openBanking: false,
    intelligence: false,
  },
  professional: {
    id: "professional",
    name: "Professional",
    maxClients: 100,
    maxUsers: 5,
    maxOcrPerMonth: 500,
    maxSignaturesPerMonth: 30,
    openBanking: true,
    intelligence: true,
  },
  business: {
    id: "business",
    name: "Business",
    maxClients: 100,
    maxUsers: 10,
    maxOcrPerMonth: 500,
    maxSignaturesPerMonth: 30,
    openBanking: true,
    intelligence: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    maxClients: 99999,
    maxUsers: 99999,
    maxOcrPerMonth: 99999,
    maxSignaturesPerMonth: 99999,
    openBanking: true,
    intelligence: true,
  },
  intelligence: {
    id: "intelligence",
    name: "Intelligence Add-on",
    maxClients: 99999,
    maxUsers: 99999,
    maxOcrPerMonth: 99999,
    maxSignaturesPerMonth: 99999,
    openBanking: true,
    intelligence: true,
  },
}

export function resolvePlanId(raw: string | null | undefined): PlanId {
  if (!raw) return "trial"
  const key = raw.toLowerCase() as PlanId
  if (key in PLAN_LIMITS) return key
  return "trial"
}

export function getPlanLimits(planId: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[resolvePlanId(planId)]
}

export class PlanLimitError extends Error {
  code: "CLIENTS" | "USERS" | "OCR" | "SIGNATURES" | "FEATURE"
  constructor(code: PlanLimitError["code"], message: string) {
    super(message)
    this.code = code
    this.name = "PlanLimitError"
  }
}
