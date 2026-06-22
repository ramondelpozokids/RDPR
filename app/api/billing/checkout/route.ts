import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth/config"
import { getStripeClient, planOrThrow } from "@/lib/stripe/client"
import type { BillingPlanId } from "@/lib/stripe/billing"

const bodySchema = z.object({
  plan: z.enum(["starter", "intelligence", "business", "enterprise"]),
})

export async function POST(req: NextRequest) {
  const stripe = getStripeClient()
  if (!stripe) {
    return NextResponse.json(
      { error: "Pagos online disponibles tras activar Stripe en RDPR Digital S.L." },
      { status: 503 }
    )
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Plan no válido" }, { status: 400 })

  const plan = planOrThrow(parsed.data.plan as BillingPlanId)
  const session = await auth()
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? req.nextUrl.origin

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: plan.amountCents,
          recurring: { interval: "month" },
          product_data: {
            name: plan.name,
            description: plan.description,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard/settings?billing=success`,
    cancel_url: `${baseUrl}/precios?billing=cancelled`,
    customer_email: session?.user?.email ?? undefined,
    metadata: { plan: parsed.data.plan },
  })

  return NextResponse.json({ success: true, url: checkout.url })
}
