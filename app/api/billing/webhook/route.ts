import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma/client"
import { getStripeClient } from "@/lib/stripe/client"
import { ensureFirmForCompany, syncFirmBilling } from "@/lib/firm/ensure"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 })
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Firma ausente" }, { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Firma inválida"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const companyId = session.metadata?.companyId
      const plan = session.metadata?.plan
      if (companyId) {
        const billingData = {
          billingPlan: plan ?? undefined,
          billingStatus: "active",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : undefined,
        }
        await prisma.company.update({
          where: { id: companyId },
          data: billingData,
        })
        const firm = await ensureFirmForCompany(companyId)
        if (firm) {
          await syncFirmBilling(firm.id, billingData)
        }
        await prisma.activityLog.create({
          data: {
            companyId,
            action: "BILLING_SUBSCRIPTION_ACTIVE",
            entity: "Company",
            entityId: companyId,
            metadata: { plan, sessionId: session.id },
          },
        })
      }
      break
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const company = await prisma.company.findFirst({
        where: { stripeSubscriptionId: sub.id },
      })
      if (company) {
        const billingData = {
          billingStatus: sub.status,
          billingPlan: sub.metadata?.plan ?? company.billingPlan ?? undefined,
        }
        await prisma.company.update({
          where: { id: company.id },
          data: billingData,
        })
        const firm = await ensureFirmForCompany(company.id)
        if (firm) {
          await syncFirmBilling(firm.id, billingData)
        }
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
