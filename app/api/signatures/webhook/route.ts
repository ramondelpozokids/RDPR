import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { onSignatureCompleted } from "@/lib/signatures/provider"

/** Webhook — proveedor firma (Signaturit / DocuSign). */
export async function POST(req: NextRequest) {
  const secret = process.env.SIGNATURE_WEBHOOK_SECRET
  if (secret) {
    const header = req.headers.get("x-signature-secret")
    if (header !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const externalId = typeof body.externalId === "string" ? body.externalId : null
  const event = typeof body.event === "string" ? body.event : "signed"

  if (!externalId) {
    return NextResponse.json({ error: "externalId requerido" }, { status: 400 })
  }

  const request = await prisma.signatureRequest.findFirst({ where: { externalId } })
  if (!request) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 })
  }

  const status =
    event === "signed" ? "SIGNED" : event === "rejected" ? "REJECTED" : event === "expired" ? "EXPIRED" : "PENDING"

  await prisma.signatureRequest.update({
    where: { id: request.id },
    data: {
      status,
      signedAt: status === "SIGNED" ? new Date() : request.signedAt,
    },
  })

  if (status === "SIGNED") {
    await onSignatureCompleted(request.id)
  }

  return NextResponse.json({ received: true })
}
