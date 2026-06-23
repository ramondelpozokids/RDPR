import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma/client"
import { markChecklistDone, completeOnboardingTasks } from "@/lib/crm/checklist-sync"

export type SignatureProviderResult = {
  externalId: string
  signingUrl: string
}

const SIGNATURIT_SANDBOX = "https://api.sandbox.signaturit.com/v3/signatures.json"
const SIGNATURIT_PROD = "https://api.signaturit.com/v3/signatures.json"

async function createSignaturitRequest(input: {
  title: string
  signerEmail: string
  signerName?: string | null
  documentUrl: string
}): Promise<SignatureProviderResult> {
  const apiKey = process.env.SIGNATURIT_API_KEY!
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const endpoint = process.env.SIGNATURIT_MODE === "prod" ? SIGNATURIT_PROD : SIGNATURIT_SANDBOX

  const body = new FormData()
  body.append("name", input.title)
  body.append("recipients[0][email]", input.signerEmail)
  if (input.signerName) body.append("recipients[0][name]", input.signerName)
  body.append("events_url", `${base}/api/signatures/webhook`)
  body.append("files[0]", input.documentUrl)

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Signaturit error: ${err.slice(0, 200)}`)
  }

  const data = (await res.json()) as { id: string; documents?: { url?: string }[] }
  return {
    externalId: data.id,
    signingUrl: data.documents?.[0]?.url ?? `${base}/portal/firmas`,
  }
}

export async function createSignatureRequest(input: {
  title: string
  signerEmail: string
  signerName?: string | null
  documentUrl: string
  customerId?: string
}): Promise<SignatureProviderResult> {
  if (process.env.SIGNATURIT_API_KEY) {
    return createSignaturitRequest(input)
  }

  const externalId = `sig_${randomBytes(8).toString("hex")}`
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const signingUrl = input.customerId
    ? `${base}/portal/firmas?sign=${externalId}`
    : `${base}/dashboard/signatures?pending=${externalId}`

  return { externalId, signingUrl }
}

/** Tras firma: activa grant, checklist y tareas. */
export async function onSignatureCompleted(signatureRequestId: string) {
  const req = await prisma.signatureRequest.findUnique({
    where: { id: signatureRequestId },
    include: { authorizationGrant: true },
  })
  if (!req || !req.customerId) return

  if (req.authorizationGrant) {
    await prisma.authorizationGrant.update({
      where: { id: req.authorizationGrant.id },
      data: { status: "ACTIVE", grantedAt: new Date() },
    })
  }

  await markChecklistDone(req.customerId, "authorization")
  await completeOnboardingTasks(req.customerId, req.companyId, "autorización")
}

/** Crea solicitud de autorización legal para onboarding. */
export async function createAuthorizationSignature(input: {
  companyId: string
  customerId: string
  signerEmail: string
  signerName?: string
}) {
  let doc = await prisma.document.findFirst({
    where: {
      companyId: input.companyId,
      customerId: input.customerId,
      category: "AUTHORIZATION",
    },
    orderBy: { createdAt: "desc" },
  })

  if (!doc) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    doc = await prisma.document.create({
      data: {
        companyId: input.companyId,
        customerId: input.customerId,
        name: "Autorización representación RDPR.pdf",
        fileUrl: `${base}/portal/firmas`,
        fileType: "application/pdf",
        fileSize: 0,
        category: "AUTHORIZATION",
        source: "INTERNAL",
      },
    })
  }

  const provider = await createSignatureRequest({
    title: "Autorización para actuar en nombre del cliente",
    signerEmail: input.signerEmail,
    signerName: input.signerName,
    documentUrl: doc.fileUrl,
    customerId: input.customerId,
  })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const signatureRequest = await prisma.signatureRequest.create({
    data: {
      companyId: input.companyId,
      customerId: input.customerId,
      documentId: doc.id,
      title: "Autorización para actuar en nombre del cliente",
      signerEmail: input.signerEmail,
      signerName: input.signerName,
      externalId: provider.externalId,
      expiresAt,
    },
  })

  await prisma.authorizationGrant.create({
    data: {
      companyId: input.companyId,
      customerId: input.customerId,
      signatureRequestId: signatureRequest.id,
      scopes: ["AEAT_PRESENT", "SS_MANAGE", "BANK_READ", "FULL_REPRESENTATION"],
      status: "PENDING",
    },
  })

  return { signatureRequest, signingUrl: provider.signingUrl }
}
