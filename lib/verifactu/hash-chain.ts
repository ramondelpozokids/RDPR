import { createHash } from "crypto"
import { prisma } from "@/lib/prisma/client"

export type VerifactuHashInput = {
  issuerTaxId: string
  invoiceNumber: string
  issueDate: Date
  total: number
  previousHash?: string | null
}

/** Cadena hash Verifactu v1 (estructura preparada para spec AEAT). */
export function computeVerifactuHash(input: VerifactuHashInput): string {
  const payload = [
    input.issuerTaxId.trim().toUpperCase(),
    input.invoiceNumber.trim(),
    input.issueDate.toISOString().slice(0, 10),
    input.total.toFixed(2),
    input.previousHash ?? "0",
  ].join("|")
  return createHash("sha256").update(payload, "utf8").digest("hex")
}

export async function getPreviousVerifactuHash(companyId: string): Promise<string | null> {
  const last = await prisma.verifactuRegistryEntry.findFirst({
    where: { companyId, status: "ACCEPTED" },
    orderBy: { submittedAt: "desc" },
    select: { hash: true },
  })
  return last?.hash ?? null
}
