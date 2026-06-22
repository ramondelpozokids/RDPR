import { createHash } from "crypto"

/** Huella orientativa v1 (sustituir por registro Verifactu certificado cuando esté activo). */
export function generateComplianceHash(input: {
  number: string
  issueDate: Date
  total: number
  taxId?: string | null
  customerTaxId?: string | null
}): string {
  const payload = [
    input.number,
    input.issueDate.toISOString().slice(0, 10),
    input.total.toFixed(2),
    input.taxId ?? "",
    input.customerTaxId ?? "",
  ].join("|")
  return createHash("sha256").update(payload, "utf8").digest("hex")
}

export function formatComplianceHashShort(hash: string | null | undefined): string {
  if (!hash) return "—"
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`
}
