/** Payload QR Verifactu (modo test — sustituir URL oficial en producción). */
export function buildVerifactuQrPayload(input: {
  hash: string
  issuerTaxId: string
  invoiceNumber: string
  total: number
  issueDate: Date
}): string {
  const base =
    process.env.AEAT_VERIFACTU_QR_BASE ?? "https://rdpr.es/verifactu/verify"
  const params = new URLSearchParams({
    h: input.hash.slice(0, 16),
    nif: input.issuerTaxId,
    num: input.invoiceNumber,
    imp: input.total.toFixed(2),
    f: input.issueDate.toISOString().slice(0, 10),
  })
  return `${base}?${params.toString()}`
}
