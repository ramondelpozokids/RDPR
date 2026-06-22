import { prisma } from "@/lib/prisma/client"

export type EFacturaStats = {
  total: number
  issued: number
  sent: number
  signed: number
  registered: number
  withHash: number
  verifactuRegistered: number
  missingCompanyTaxId: boolean
  missingCustomerTaxId: number
  complianceScore: number
}

export async function getEFacturaStats(companyId: string): Promise<EFacturaStats> {
  const [company, invoices, verifactuAccepted] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId }, select: { taxId: true } }),
    prisma.invoice.findMany({
      where: { companyId, status: { not: "CANCELLED" }, documentType: "INVOICE" },
      include: { customer: { select: { taxId: true } } },
    }),
    prisma.verifactuRegistryEntry.count({ where: { companyId, status: "ACCEPTED" } }),
  ])

  const total = invoices.length
  const issued = invoices.filter((i) =>
    ["ISSUED", "SENT", "SIGNED", "REGISTERED"].includes(i.electronicStatus)
  ).length
  const sent = invoices.filter((i) => ["SENT", "REGISTERED"].includes(i.electronicStatus)).length
  const signed = invoices.filter((i) => ["SIGNED", "REGISTERED"].includes(i.electronicStatus)).length
  const registered = invoices.filter((i) => i.electronicStatus === "REGISTERED").length
  const withHash = invoices.filter((i) => i.complianceHash).length
  const missingCustomerTaxId = invoices.filter((i) => !i.customer.taxId).length
  const verifactuRegistered = verifactuAccepted

  let score = 0
  if (company?.taxId) score += 25
  if (total > 0 && withHash === total) score += 20
  if (total > 0 && missingCustomerTaxId === 0) score += 20
  if (sent > 0) score += 10
  if (registered > 0) score += 10
  if (verifactuRegistered > 0) score += 15

  return {
    total,
    issued,
    sent,
    signed,
    registered,
    withHash,
    verifactuRegistered,
    missingCompanyTaxId: !company?.taxId,
    missingCustomerTaxId,
    complianceScore: Math.min(100, score),
  }
}

export type ComplianceIssue = {
  id: string
  type: "warning" | "danger" | "info"
  title: string
  description: string
  href?: string
}

export async function getEFacturaComplianceIssues(companyId: string): Promise<ComplianceIssue[]> {
  const stats = await getEFacturaStats(companyId)
  const issues: ComplianceIssue[] = []

  if (stats.missingCompanyTaxId) {
    issues.push({
      id: "company-tax-id",
      type: "danger",
      title: "NIF/CIF de empresa no configurado",
      description: "Obligatorio para facturación electrónica B2B y export Facturae.",
      href: "/dashboard/settings",
    })
  }

  if (stats.missingCustomerTaxId > 0) {
    issues.push({
      id: "customer-tax-id",
      type: "warning",
      title: `${stats.missingCustomerTaxId} cliente(s) sin NIF/CIF`,
      description: "Requerido para intercambio electrónico entre empresas (Ley Crea y Crece).",
      href: "/dashboard/crm",
    })
  }

  if (stats.total > 0 && stats.withHash < stats.total) {
    issues.push({
      id: "missing-hash",
      type: "warning",
      title: "Facturas sin huella de cumplimiento",
      description: "Emite o regenera facturas para aplicar huella Verifactu v1.",
      href: "/dashboard/finance/invoicing",
    })
  }

  if (stats.verifactuRegistered === 0 && stats.total > 0) {
    issues.push({
      id: "verifactu-register",
      type: "info",
      title: "Registro Verifactu disponible (modo test)",
      description: "Registra facturas en AEAT desde acciones de factura o Presentación AEAT.",
      href: "/dashboard/finance/aeat",
    })
  } else if (stats.verifactuRegistered > 0) {
    issues.unshift({
      id: "verifactu-ok",
      type: "info",
      title: `${stats.verifactuRegistered} factura(s) en registro Verifactu`,
      description: "Registro AEAT activo en modo test/simulación.",
      href: "/dashboard/finance/aeat",
    })
  }

  if (issues.filter((i) => i.type === "danger" || i.type === "warning").length === 0 && stats.total > 0) {
    issues.unshift({
      id: "compliance-ok",
      type: "info",
      title: "Base eFactura operativa",
      description: `Puntuación de cumplimiento: ${stats.complianceScore}/100. Exporta Facturae desde cada factura.`,
    })
  }

  return issues
}
