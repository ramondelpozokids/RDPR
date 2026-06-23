import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requirePortalContext } from "@/lib/portal/context"
import { onSignatureCompleted } from "@/lib/signatures/provider"

export async function GET() {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const signatures = await prisma.signatureRequest.findMany({
    where: { companyId: ctx.companyId, customerId: ctx.customerId },
    include: {
      document: { select: { id: true, name: true, fileUrl: true } },
      authorizationGrant: { select: { scopes: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json({ success: true, data: signatures })
}

/** Simula firma en modo dev (sin Signaturit). */
export async function POST(req: NextRequest) {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const externalId = typeof body.externalId === "string" ? body.externalId : null
  if (!externalId) return NextResponse.json({ error: "externalId requerido" }, { status: 400 })

  const signature = await prisma.signatureRequest.findFirst({
    where: {
      externalId,
      companyId: ctx.companyId,
      customerId: ctx.customerId,
      status: "PENDING",
    },
  })
  if (!signature) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })

  if (process.env.SIGNATURIT_API_KEY) {
    return NextResponse.json(
      { error: "Use el enlace de firma del proveedor Signaturit" },
      { status: 400 }
    )
  }

  await prisma.signatureRequest.update({
    where: { id: signature.id },
    data: { status: "SIGNED", signedAt: new Date() },
  })

  await onSignatureCompleted(signature.id)

  return NextResponse.json({ success: true, message: "Documento firmado correctamente" })
}
