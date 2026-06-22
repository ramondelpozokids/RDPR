import { randomBytes } from "crypto"

export type SignatureProviderResult = {
  externalId: string
  signingUrl: string
}

/** Proveedor firma skeleton (Signaturit / DocuSign / Autofirma — integración futura). */
export async function createSignatureRequest(input: {
  title: string
  signerEmail: string
  signerName?: string | null
  documentUrl: string
}): Promise<SignatureProviderResult> {
  const externalId = `sig_${randomBytes(8).toString("hex")}`
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return {
    externalId,
    signingUrl: `${base}/dashboard/signatures?pending=${externalId}&doc=${encodeURIComponent(input.documentUrl)}`,
  }
}
