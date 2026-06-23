import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; incidentId: string } }
) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const incident = await prisma.customerIncident.findFirst({
    where: { id: params.incidentId, companyId, customerId: params.id },
  })
  if (!incident) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { status, ...rest } = parsed.data
  const resolved =
    status && (status === "RESOLVED" || status === "CLOSED") && !incident.resolvedAt
      ? { resolvedAt: new Date() }
      : status && status !== "RESOLVED" && status !== "CLOSED"
        ? { resolvedAt: null }
        : {}

  const updated = await prisma.customerIncident.update({
    where: { id: params.incidentId },
    data: { ...rest, ...(status ? { status } : {}), ...resolved },
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; incidentId: string } }
) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const incident = await prisma.customerIncident.findFirst({
    where: { id: params.incidentId, companyId, customerId: params.id },
  })
  if (!incident) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.customerIncident.delete({ where: { id: params.incidentId } })
  return NextResponse.json({ success: true })
}
