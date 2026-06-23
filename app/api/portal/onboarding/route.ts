import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requirePortalContext } from "@/lib/portal/context"
import { markChecklistDone, completeOnboardingTasks } from "@/lib/crm/checklist-sync"
import { createAuthorizationSignature } from "@/lib/signatures/provider"

export async function GET() {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const profile = await prisma.customerProfile.findUnique({
    where: { customerId: ctx.customerId },
  })

  const pendingSignatures = await prisma.signatureRequest.findMany({
    where: {
      companyId: ctx.companyId,
      customerId: ctx.customerId,
      status: "PENDING",
    },
    include: { document: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    success: true,
    data: {
      profile: profile ?? { onboardingStatus: "PENDING", onboardingStep: 0 },
      customer: { name: ctx.customer.name, email: ctx.customer.email },
      pendingSignatures,
    },
  })
}

const patchSchema = z.object({
  step: z.number().int().min(0).max(5).optional(),
  legalName: z.string().optional(),
  dniNie: z.string().optional(),
  fiscalAddress: z.string().optional(),
  fiscalCity: z.string().optional(),
  fiscalPostalCode: z.string().optional(),
  entityType: z.enum(["AUTONOMO", "SL", "SA", "OTHER"]).optional(),
  requestAuthorization: z.boolean().optional(),
})

export async function PATCH(req: NextRequest) {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { requestAuthorization, step, ...profileFields } = parsed.data

  if (Object.keys(profileFields).length > 0 || step !== undefined) {
    await prisma.customerProfile.upsert({
      where: { customerId: ctx.customerId },
      create: {
        customerId: ctx.customerId,
        ...profileFields,
        onboardingStatus: "IN_PROGRESS",
        onboardingStep: step ?? 1,
      },
      update: {
        ...profileFields,
        ...(step !== undefined ? { onboardingStep: step, onboardingStatus: "IN_PROGRESS" } : {}),
      },
    })

    if (profileFields.dniNie || profileFields.legalName) {
      await markChecklistDone(ctx.customerId, "profile")
      await completeOnboardingTasks(ctx.customerId, ctx.companyId, "datos fiscales")
    }
  }

  let authorization: { signingUrl: string } | null = null
  if (requestAuthorization && ctx.customer.email) {
    const result = await createAuthorizationSignature({
      companyId: ctx.companyId,
      customerId: ctx.customerId,
      signerEmail: ctx.customer.email,
      signerName: ctx.customer.name,
    })
    authorization = { signingUrl: result.signingUrl }
  }

  const profile = await prisma.customerProfile.findUnique({
    where: { customerId: ctx.customerId },
  })

  return NextResponse.json({ success: true, data: { profile, authorization } })
}
