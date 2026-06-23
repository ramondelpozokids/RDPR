import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { syncMissingDocTasks } from "@/lib/crm/auto-tasks"
import { logCustomerActivity } from "@/lib/crm/activity-log"
import type { ChecklistItem } from "@/lib/crm/checklist-sync"

const profileSchema = z.object({
  entityType: z.enum(["AUTONOMO", "SL", "SA", "OTHER"]).optional(),
  legalName: z.string().optional(),
  dniNie: z.string().optional(),
  cnae: z.string().optional(),
  fiscalAddress: z.string().optional(),
  fiscalCity: z.string().optional(),
  fiscalPostalCode: z.string().optional(),
  province: z.string().optional(),
  vatFilingPeriod: z.enum(["QUARTERLY", "MONTHLY"]).optional(),
  irpfRegime: z.enum(["DIRECT_ESTIMATION", "OBJECTIVE_MODULES"]).optional().nullable(),
  socialSecurityNum: z.string().optional(),
  constitutionDate: z.string().optional().nullable(),
  onboardingStatus: z.enum(["PENDING", "IN_PROGRESS", "COMPLETE"]).optional(),
  onboardingStep: z.number().int().min(0).optional(),
  checklist: z.array(z.object({ id: z.string(), label: z.string(), done: z.boolean() })).optional(),
})

async function assertCustomer(companyId: string, customerId: string) {
  return prisma.customer.findFirst({ where: { id: customerId, companyId } })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await assertCustomer(companyId, params.id)
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  let profile = await prisma.customerProfile.findUnique({ where: { customerId: params.id } })
  if (!profile) {
    profile = await prisma.customerProfile.create({
      data: { customerId: params.id },
    })
  }

  return NextResponse.json({ success: true, data: profile })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await assertCustomer(companyId, params.id)
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body = await req.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { constitutionDate, ...rest } = parsed.data
  const data = {
    ...rest,
    ...(constitutionDate !== undefined && {
      constitutionDate: constitutionDate ? new Date(constitutionDate) : null,
    }),
  }

  const profile = await prisma.customerProfile.upsert({
    where: { customerId: params.id },
    create: { customerId: params.id, ...data },
    update: data,
  })

  if (parsed.data.checklist?.length) {
    await syncMissingDocTasks(companyId, params.id, parsed.data.checklist as ChecklistItem[])
    await logCustomerActivity({
      companyId,
      customerId: params.id,
      action: "CHECKLIST_UPDATED",
      entity: "CustomerProfile",
      entityId: profile.id,
      metadata: {
        done: parsed.data.checklist.filter((c) => c.done).length,
        total: parsed.data.checklist.length,
      },
    })
  }

  return NextResponse.json({ success: true, data: profile })
}
