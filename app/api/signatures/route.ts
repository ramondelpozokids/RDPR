import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { createSignatureRequest } from "@/lib/signatures/provider"
import { assertCanCreateSignature } from "@/lib/billing/usage"
import { PlanLimitError } from "@/lib/billing/plan-limits"

export async function GET() {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await prisma.signatureRequest.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      document: { select: { id: true, name: true, fileUrl: true } },
      customer: { select: { id: true, name: true } },
      legalCase: { select: { id: true, title: true } },
    },
    take: 100,
  })

  return NextResponse.json({ data })
}

const postSchema = z.object({
  documentId: z.string(),
  title: z.string().min(1),
  signerEmail: z.string().email(),
  signerName: z.string().optional(),
  customerId: z.string().optional(),
  legalCaseId: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const document = await prisma.document.findFirst({
    where: { id: parsed.data.documentId, companyId },
  })
  if (!document) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })

  try {
    await assertCanCreateSignature(companyId)
  } catch (e) {
    if (e instanceof PlanLimitError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 402 })
    }
    throw e
  }

  const provider = await createSignatureRequest({
    title: parsed.data.title,
    signerEmail: parsed.data.signerEmail,
    signerName: parsed.data.signerName,
    documentUrl: document.fileUrl,
    customerId: parsed.data.customerId,
  })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const request = await prisma.signatureRequest.create({
    data: {
      companyId,
      documentId: document.id,
      customerId: parsed.data.customerId,
      legalCaseId: parsed.data.legalCaseId,
      title: parsed.data.title,
      signerEmail: parsed.data.signerEmail,
      signerName: parsed.data.signerName,
      notes: parsed.data.notes,
      externalId: provider.externalId,
      expiresAt,
    },
    include: {
      document: { select: { id: true, name: true, fileUrl: true } },
      customer: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ data: request, signingUrl: provider.signingUrl })
}
