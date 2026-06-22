import Stripe from "stripe"
import { BILLING_PLANS, type BillingPlanId } from "@/lib/stripe/billing"

export { BILLING_PLANS, type BillingPlanId }

export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: "2024-04-10" })
}

export function planOrThrow(planId: string): (typeof BILLING_PLANS)[BillingPlanId] {
  if (!(planId in BILLING_PLANS)) throw new Error("Plan no válido")
  return BILLING_PLANS[planId as BillingPlanId]
}
