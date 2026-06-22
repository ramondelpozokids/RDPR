export const BILLING_PLANS = {
  starter: {
    name: "RDPR Starter",
    amountCents: 4900,
    description: "1 empresa · CRM · facturación · 1 usuario",
  },
  intelligence: {
    name: "RDPR Intelligence",
    amountCents: 9900,
    description: "Add-on IA avanzada",
  },
  business: {
    name: "RDPR Business",
    amountCents: 14900,
    description: "Hasta 10 usuarios · finanzas completas",
  },
  enterprise: {
    name: "RDPR Enterprise",
    amountCents: 49900,
    description: "Multi-empresa · SSO · API",
  },
} as const

export type BillingPlanId = keyof typeof BILLING_PLANS
