import type { Company, Customer, Invoice } from "@prisma/client"
import { computeVerifactuHash, getPreviousVerifactuHash } from "@/lib/verifactu/hash-chain"
import { buildVerifactuQrPayload } from "@/lib/verifactu/qr"

export type VerifactuRecord = {
  recordType: "ALTA" | "ANULACION"
  hash: string
  previousHash: string | null
  qrPayload: string
}

export async function buildVerifactuRecord(
  invoice: Invoice & { company: Company; customer: Customer },
  recordType: "ALTA" | "ANULACION" = "ALTA"
): Promise<VerifactuRecord> {
  if (!invoice.company.taxId) {
    throw new Error("NIF/CIF de empresa obligatorio para Verifactu")
  }

  const previousHash = await getPreviousVerifactuHash(invoice.companyId)
  const hash = computeVerifactuHash({
    issuerTaxId: invoice.company.taxId,
    invoiceNumber: invoice.number,
    issueDate: invoice.issueDate,
    total: invoice.total,
    previousHash,
  })

  const qrPayload = buildVerifactuQrPayload({
    hash,
    issuerTaxId: invoice.company.taxId,
    invoiceNumber: invoice.number,
    total: invoice.total,
    issueDate: invoice.issueDate,
  })

  return { recordType, hash, previousHash, qrPayload }
}
