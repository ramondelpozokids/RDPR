import { prisma } from "@/lib/prisma/client"
import type { Prisma } from "@prisma/client"
import { submitTaxFilingToAeat } from "@/lib/aeat/client"
import { exportTaxModelCsv } from "@/lib/tax/export"

function periodString(year: number, quarter?: number | null, month?: number | null): string {
  if (month) return `${year}-${String(month).padStart(2, "0")}`
  if (quarter) return `${year}-Q${quarter}`
  return String(year)
}

export async function submitAeatTaxFiling(
  companyId: string,
  modelId: string,
  opts: { year: number; quarter?: number; month?: number }
) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { taxId: true },
  })
  if (!company) throw new Error("Empresa no encontrada")

  const period = periodString(opts.year, opts.quarter, opts.month)
  const exportResult = await exportTaxModelCsv(companyId, modelId, period)
  if (!exportResult) throw new Error("No se pudo generar la exportación del modelo")

  const config = await prisma.companyVerifactuConfig.findUnique({ where: { companyId } })
  const mode = config?.mode ?? process.env.AEAT_VERIFACTU_MODE ?? "test"

  const aeat = await submitTaxFilingToAeat({
    companyId,
    modelId,
    periodYear: opts.year,
    periodQuarter: opts.quarter ?? null,
    periodMonth: opts.month ?? null,
    issuerTaxId: company.taxId ?? "",
    csvPreview: exportResult.csv.slice(0, 500),
  })

  const now = new Date()
  const filing = await prisma.aeatTaxFiling.create({
    data: {
      companyId,
      modelId,
      periodYear: opts.year,
      periodQuarter: opts.quarter ?? null,
      periodMonth: opts.month ?? null,
      mode,
      certificateRef: config?.certificateRef ?? process.env.AEAT_CERTIFICATE_REF ?? null,
      status: aeat.status === "ACCEPTED" ? "ACCEPTED" : "REJECTED",
      aeatCsv: aeat.csv,
      rejectionReason: aeat.rejectionReason,
      submittedAt: now,
      payload: { filename: exportResult.filename, csvLength: exportResult.csv.length },
      responsePayload: aeat.responsePayload as Prisma.InputJsonValue,
    },
  })

  return { filing, aeat, exportResult }
}
