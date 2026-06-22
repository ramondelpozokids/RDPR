import type { AeatMode, AeatSubmitResult, TaxFilingSubmitInput, VerifactuSubmitInput } from "@/lib/aeat/types"

export function getAeatMode(): AeatMode {
  const mode = process.env.AEAT_VERIFACTU_MODE ?? "test"
  return mode === "prod" ? "prod" : "test"
}

function requireProdCertificate(): void {
  if (getAeatMode() === "prod" && !process.env.AEAT_CERTIFICATE_REF) {
    throw new Error("AEAT_CERTIFICATE_REF requerido en modo producción")
  }
}

function mockCsv(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

/** Cliente AEAT skeleton — mock en test, stub en prod hasta certificado real. */
export async function submitVerifactuToAeat(input: VerifactuSubmitInput): Promise<AeatSubmitResult> {
  requireProdCertificate()
  const mode = getAeatMode()

  if (!input.issuerTaxId) {
    return {
      success: false,
      status: "REJECTED",
      rejectionReason: "NIF emisor inválido",
      responsePayload: { mode, error: "INVALID_ISSUER" },
    }
  }

  const csv = mockCsv("VF")
  return {
    success: true,
    status: "ACCEPTED",
    csv,
    responsePayload: {
      mode,
      service: "verifactu",
      invoiceId: input.invoiceId,
      hash: input.hash,
      timestamp: new Date().toISOString(),
      note: mode === "test" ? "Respuesta simulada — configure certificado para producción" : "Enviado a AEAT (stub)",
    },
  }
}

export async function submitTaxFilingToAeat(input: TaxFilingSubmitInput): Promise<AeatSubmitResult> {
  requireProdCertificate()
  const mode = getAeatMode()

  if (!input.issuerTaxId) {
    return {
      success: false,
      status: "REJECTED",
      rejectionReason: "NIF/CIF de empresa no configurado",
      responsePayload: { mode, error: "INVALID_ISSUER" },
    }
  }

  const csv = mockCsv(`AEAT-${input.modelId}`)
  return {
    success: true,
    status: "ACCEPTED",
    csv,
    responsePayload: {
      mode,
      service: "tax-filing",
      modelId: input.modelId,
      periodYear: input.periodYear,
      periodQuarter: input.periodQuarter,
      periodMonth: input.periodMonth,
      timestamp: new Date().toISOString(),
      note: mode === "test" ? "Presentación simulada — no constituye presentación telemática real" : "Enviado a AEAT (stub)",
    },
  }
}
