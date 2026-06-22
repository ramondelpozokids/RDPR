export type AeatMode = "test" | "prod"

export type AeatSubmitResult = {
  success: boolean
  status: "ACCEPTED" | "REJECTED"
  csv?: string
  rejectionReason?: string
  responsePayload: Record<string, unknown>
}

export type VerifactuSubmitInput = {
  companyId: string
  invoiceId: string
  recordType: string
  hash: string
  previousHash?: string | null
  qrPayload?: string | null
  issuerTaxId: string
  invoiceNumber: string
  total: number
}

export type TaxFilingSubmitInput = {
  companyId: string
  modelId: string
  periodYear: number
  periodQuarter?: number | null
  periodMonth?: number | null
  issuerTaxId: string
  csvPreview: string
}
