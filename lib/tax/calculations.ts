import { prisma } from "@/lib/prisma/client"
import { backfillAllJournalEntries } from "@/lib/accounting/journal"
import { ACCOUNT_CODES } from "@/lib/accounting/pgc-accounts"
import {
  DEFAULT_CORPORATE_TAX_RATE,
  DEFAULT_CORPORATE_FRACTIONAL_RATE,
  DEFAULT_IRPF_FRACTIONAL_RATE,
  DEFAULT_PROFESSIONAL_WITHHOLDING_RATE,
  MODEL_347_THRESHOLD,
  MODEL_347_OPERATION_TYPES,
} from "@/lib/tax/constants"
import {
  getCurrentQuarterPeriod,
  getQuarterPeriod,
  getYearPeriod,
  parsePeriodParam,
  quarterOf,
  type TaxPeriod,
} from "@/lib/tax/periods"
import type { TaxEntityType, VatFilingPeriod } from "@prisma/client"

export type TaxCompanyProfile = {
  id: string
  name: string
  taxId: string | null
  taxEntityType: TaxEntityType
  vatFilingPeriod: VatFilingPeriod
  irpfRegime: string | null
}

export async function getTaxCompanyProfile(companyId: string): Promise<TaxCompanyProfile | null> {
  return prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      taxId: true,
      taxEntityType: true,
      vatFilingPeriod: true,
      irpfRegime: true,
    },
  })
}

async function accountBalanceInPeriod(
  companyId: string,
  code: string,
  from: Date,
  to: Date
): Promise<number> {
  const account = await prisma.chartOfAccount.findUnique({
    where: { companyId_code: { companyId, code } },
  })
  if (!account) return 0

  const lines = await prisma.journalLine.findMany({
    where: {
      accountId: account.id,
      entry: { companyId, date: { gte: from, lte: to } },
    },
    select: { debit: true, credit: true },
  })

  const debit = lines.reduce((s, l) => s + l.debit, 0)
  const credit = lines.reduce((s, l) => s + l.credit, 0)
  const isCreditNature =
    account.type === "LIABILITY" || account.type === "EQUITY" || account.type === "INCOME"
  return isCreditNature ? credit - debit : debit - credit
}

async function revenueAndExpenses(companyId: string, from: Date, to: Date) {
  await backfillAllJournalEntries(companyId)

  const [revenue, expenseAgg] = await Promise.all([
    accountBalanceInPeriod(companyId, ACCOUNT_CODES.INGRESOS_SERVICIOS, from, to),
    prisma.journalLine.aggregate({
      where: {
        account: { companyId, type: "EXPENSE" },
        entry: { companyId, date: { gte: from, lte: to } },
      },
      _sum: { debit: true },
    }),
  ])

  const expenses = expenseAgg._sum.debit ?? 0
  return { revenue, expenses, netIncome: revenue - expenses }
}

export type Model303Result = {
  period: TaxPeriod
  baseImponible: number
  ivaRepercutido: number
  ivaSoportado: number
  ivaNeto: number
  invoiceCount: number
  casillas: Record<string, number>
  disclaimer: string
}

export async function calculateModel303(
  companyId: string,
  periodParam?: string
): Promise<Model303Result> {
  const period = parsePeriodParam(periodParam)
  await backfillAllJournalEntries(companyId)

  const [repercutido, soportado, invoices] = await Promise.all([
    accountBalanceInPeriod(companyId, ACCOUNT_CODES.IVA_REPERCUTIDO, period.start, period.end),
    accountBalanceInPeriod(companyId, ACCOUNT_CODES.IVA_SOPORTADO, period.start, period.end),
    prisma.invoice.findMany({
      where: {
        companyId,
        issueDate: { gte: period.start, lte: period.end },
        status: { not: "CANCELLED" },
        documentType: "INVOICE",
      },
      select: { subtotal: true },
    }),
  ])

  const baseImponible = invoices.reduce((s, i) => s + i.subtotal, 0)
  const ivaNeto = repercutido - soportado

  return {
    period,
    baseImponible,
    ivaRepercutido: repercutido,
    ivaSoportado: soportado,
    ivaNeto,
    invoiceCount: invoices.length,
    casillas: {
      "[03] Base imponible 21%": baseImponible,
      "[27] Cuota devengada": repercutido,
      "[29] Cuota soportada deducible": soportado,
      "[46] Resultado (ingresar/devolver)": ivaNeto,
    },
    disclaimer:
      "Estimación orientativa desde libro diario (477/472) y facturas emitidas. No sustituye la presentación en AEAT.",
  }
}

export type Model390Result = {
  period: TaxPeriod
  trimestres: Array<{
    quarter: number
    ivaRepercutido: number
    ivaSoportado: number
    ivaNeto: number
  }>
  totalRepercutido: number
  totalSoportado: number
  totalNeto: number
  disclaimer: string
}

export async function calculateModel390(companyId: string, year?: number): Promise<Model390Result> {
  const y = year ?? new Date().getFullYear()
  const trimestres = await Promise.all(
    ([1, 2, 3, 4] as const).map(async (q) => {
      const p = getQuarterPeriod(y, q)
      const [rep, sop] = await Promise.all([
        accountBalanceInPeriod(companyId, ACCOUNT_CODES.IVA_REPERCUTIDO, p.start, p.end),
        accountBalanceInPeriod(companyId, ACCOUNT_CODES.IVA_SOPORTADO, p.start, p.end),
      ])
      return { quarter: q, ivaRepercutido: rep, ivaSoportado: sop, ivaNeto: rep - sop }
    })
  )

  const totalRepercutido = trimestres.reduce((s, t) => s + t.ivaRepercutido, 0)
  const totalSoportado = trimestres.reduce((s, t) => s + t.ivaSoportado, 0)

  return {
    period: getYearPeriod(y),
    trimestres,
    totalRepercutido,
    totalSoportado,
    totalNeto: totalRepercutido - totalSoportado,
    disclaimer:
      "Resumen anual agregado de liquidaciones trimestrales 303. Verifique casillas oficiales antes de presentar.",
  }
}

export type Model130Result = {
  period: TaxPeriod
  ingresos: number
  gastos: number
  rendimientoNeto: number
  pagoFraccionado: number
  tipoAplicado: number
  disclaimer: string
}

export async function calculateModel130(
  companyId: string,
  periodParam?: string
): Promise<Model130Result> {
  const period = parsePeriodParam(periodParam)
  const { revenue, expenses, netIncome } = await revenueAndExpenses(
    companyId,
    period.start,
    period.end
  )
  const rendimientoNeto = Math.max(0, netIncome)
  const pagoFraccionado = rendimientoNeto * DEFAULT_IRPF_FRACTIONAL_RATE

  return {
    period,
    ingresos: revenue,
    gastos: expenses,
    rendimientoNeto,
    pagoFraccionado,
    tipoAplicado: DEFAULT_IRPF_FRACTIONAL_RATE,
    disclaimer:
      "Estimación directa simplificada (20% sobre rendimiento neto). No incluye retenciones soportadas ni cuotas SS. Consulte con asesor fiscal.",
  }
}

export type WithholdingLine = {
  recipientName: string
  recipientTaxId: string | null
  baseAmount: number
  withholdingRate: number
  withholdingAmount: number
  invoiceNumber: string
  issueDate: Date
}

export type Model111Result = {
  period: TaxPeriod
  lines: WithholdingLine[]
  totalBase: number
  totalRetenciones: number
  disclaimer: string
}

export async function calculateModel111(
  companyId: string,
  periodParam?: string
): Promise<Model111Result> {
  const period = parsePeriodParam(periodParam)

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId,
      issueDate: { gte: period.start, lte: period.end },
      status: { not: "CANCELLED" },
      documentType: "INVOICE",
    },
    include: { customer: { select: { name: true, taxId: true } } },
    orderBy: { issueDate: "desc" },
  })

  const lines: WithholdingLine[] = invoices
    .map((inv) => {
      const rate = inv.withholdingRate ?? 0
      if (rate <= 0 && !inv.withholdingAmount) return null
      const amount =
        inv.withholdingAmount ??
        (rate > 0 ? inv.subtotal * (rate / 100) : inv.subtotal * DEFAULT_PROFESSIONAL_WITHHOLDING_RATE)
      return {
        recipientName: inv.customer.name,
        recipientTaxId: inv.customer.taxId,
        baseAmount: inv.subtotal,
        withholdingRate: rate || DEFAULT_PROFESSIONAL_WITHHOLDING_RATE * 100,
        withholdingAmount: amount,
        invoiceNumber: inv.number,
        issueDate: inv.issueDate,
      }
    })
    .filter((l): l is WithholdingLine => l !== null)

  return {
    period,
    lines,
    totalBase: lines.reduce((s, l) => s + l.baseAmount, 0),
    totalRetenciones: lines.reduce((s, l) => s + l.withholdingAmount, 0),
    disclaimer:
      lines.length === 0
        ? "Sin retenciones registradas. Indique % retención IRPF en facturas a profesionales o activa el módulo de nóminas."
        : "Retenciones calculadas desde facturas con retención IRPF. Nóminas requieren integración futura con Sistema RED.",
  }
}

export type Model190Result = {
  period: TaxPeriod
  recipients: Array<{
    name: string
    taxId: string | null
    totalBase: number
    totalRetenciones: number
    invoiceCount: number
  }>
  totalRetenciones: number
  disclaimer: string
}

export async function calculateModel190(companyId: string, year?: number): Promise<Model190Result> {
  const y = year ?? new Date().getFullYear()
  const period = getYearPeriod(y)

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId,
      issueDate: { gte: period.start, lte: period.end },
      status: { not: "CANCELLED" },
      OR: [{ withholdingRate: { gt: 0 } }, { withholdingAmount: { gt: 0 } }],
    },
    include: { customer: { select: { name: true, taxId: true } } },
  })

  const map = new Map<
    string,
    { name: string; taxId: string | null; totalBase: number; totalRetenciones: number; invoiceCount: number }
  >()

  for (const inv of invoices) {
    const key = inv.customer.taxId ?? inv.customer.name
    const prev = map.get(key) ?? {
      name: inv.customer.name,
      taxId: inv.customer.taxId,
      totalBase: 0,
      totalRetenciones: 0,
      invoiceCount: 0,
    }
    const rate = inv.withholdingRate ?? 0
    const wh =
      inv.withholdingAmount ??
      (rate > 0 ? inv.subtotal * (rate / 100) : inv.subtotal * DEFAULT_PROFESSIONAL_WITHHOLDING_RATE)
    prev.totalBase += inv.subtotal
    prev.totalRetenciones += wh
    prev.invoiceCount += 1
    map.set(key, prev)
  }

  const recipients = [...map.values()].sort((a, b) => b.totalRetenciones - a.totalRetenciones)

  return {
    period,
    recipients,
    totalRetenciones: recipients.reduce((s, r) => s + r.totalRetenciones, 0),
    disclaimer:
      "Resumen anual de percepciones con retención. Debe cuadrar con las liquidaciones 111 del ejercicio.",
  }
}

export type Model200Result = {
  period: TaxPeriod
  ingresos: number
  gastos: number
  baseImponible: number
  cuotaIntegra: number
  tipoImpositivo: number
  disclaimer: string
}

export async function calculateModel200(companyId: string, year?: number): Promise<Model200Result> {
  const y = year ?? new Date().getFullYear()
  const period = getYearPeriod(y)
  const { revenue, expenses, netIncome } = await revenueAndExpenses(
    companyId,
    period.start,
    period.end
  )
  const baseImponible = Math.max(0, netIncome)
  const cuotaIntegra = baseImponible * DEFAULT_CORPORATE_TAX_RATE

  return {
    period,
    ingresos: revenue,
    gastos: expenses,
    baseImponible,
    cuotaIntegra,
    tipoImpositivo: DEFAULT_CORPORATE_TAX_RATE,
    disclaimer:
      "Estimación orientativa al 25% sobre resultado contable. No incluye ajustes fiscales, bonificaciones ni pagos fraccionados 202.",
  }
}

export type Model202Result = {
  period: TaxPeriod
  ingresos: number
  gastos: number
  baseImponible: number
  cuotaIntegraEstimada: number
  pagoFraccionado: number
  tipoImpositivo: number
  tipoFraccionado: number
  vencimientoReferencia: string
  disclaimer: string
}

const MODEL_202_DUE_LABELS: Record<number, string> = {
  1: "Abril (1–20)",
  2: "Octubre (1–20)",
  3: "Diciembre (1–20)",
  4: "Diciembre (1–20)",
}

export async function calculateModel202(
  companyId: string,
  periodParam?: string
): Promise<Model202Result> {
  const period = parsePeriodParam(periodParam)
  const { revenue, expenses, netIncome } = await revenueAndExpenses(
    companyId,
    period.start,
    period.end
  )
  const baseImponible = Math.max(0, netIncome)
  const cuotaIntegraEstimada = baseImponible * DEFAULT_CORPORATE_TAX_RATE
  const pagoFraccionado = cuotaIntegraEstimada * DEFAULT_CORPORATE_FRACTIONAL_RATE

  return {
    period,
    ingresos: revenue,
    gastos: expenses,
    baseImponible,
    cuotaIntegraEstimada,
    pagoFraccionado,
    tipoImpositivo: DEFAULT_CORPORATE_TAX_RATE,
    tipoFraccionado: DEFAULT_CORPORATE_FRACTIONAL_RATE,
    vencimientoReferencia:
      MODEL_202_DUE_LABELS[period.quarter ?? quarterOf(new Date())] ?? "Consulte calendario AEAT",
    disclaimer:
      "Estimación V1: 18% sobre cuota íntegra orientativa (25% del resultado del trimestre). No sustituye el cálculo oficial del modelo 202 ni deducciones de pagos anteriores.",
  }
}

export type Model347Party = {
  name: string
  taxId: string | null
  operationType: string
  totalAmount: number
  operationCount: number
}

export type Model347Result = {
  period: TaxPeriod
  threshold: number
  parties: Model347Party[]
  totalDeclared: number
  disclaimer: string
}

export async function calculateModel347(companyId: string, year?: number): Promise<Model347Result> {
  const y = year ?? new Date().getFullYear()
  const period = getYearPeriod(y)

  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        companyId,
        issueDate: { gte: period.start, lte: period.end },
        status: { not: "CANCELLED" },
        documentType: "INVOICE",
      },
      include: { customer: { select: { name: true, taxId: true } } },
    }),
    prisma.expense.findMany({
      where: {
        companyId,
        issueDate: { gte: period.start, lte: period.end },
        status: { not: "CANCELLED" },
      },
      select: { vendor: true, vendorTaxId: true, total: true },
    }),
  ])

  const map = new Map<string, Model347Party>()

  for (const inv of invoices) {
    const key = `sale:${inv.customer.taxId ?? inv.customer.name}`
    const prev = map.get(key) ?? {
      name: inv.customer.name,
      taxId: inv.customer.taxId,
      operationType: MODEL_347_OPERATION_TYPES.SALE,
      totalAmount: 0,
      operationCount: 0,
    }
    prev.totalAmount += inv.total
    prev.operationCount += 1
    map.set(key, prev)
  }

  for (const exp of expenses) {
    if (!exp.vendor && !exp.vendorTaxId) continue
    const key = `purchase:${exp.vendorTaxId ?? exp.vendor}`
    const prev = map.get(key) ?? {
      name: exp.vendor ?? "Proveedor",
      taxId: exp.vendorTaxId,
      operationType: MODEL_347_OPERATION_TYPES.PURCHASE,
      totalAmount: 0,
      operationCount: 0,
    }
    prev.totalAmount += exp.total
    prev.operationCount += 1
    map.set(key, prev)
  }

  const parties = [...map.values()]
    .filter((p) => p.totalAmount >= MODEL_347_THRESHOLD)
    .sort((a, b) => b.totalAmount - a.totalAmount)

  return {
    period,
    threshold: MODEL_347_THRESHOLD,
    parties,
    totalDeclared: parties.reduce((s, p) => s + p.totalAmount, 0),
    disclaimer: `Operaciones anuales ≥ ${MODEL_347_THRESHOLD.toLocaleString("es-ES")} €. Verifique NIF/CIF en clientes y NIF proveedor en gastos.`,
  }
}

export type TaxModelCalculation =
  | { modelId: "303"; data: Model303Result }
  | { modelId: "390"; data: Model390Result }
  | { modelId: "130"; data: Model130Result }
  | { modelId: "111"; data: Model111Result }
  | { modelId: "190"; data: Model190Result }
  | { modelId: "200"; data: Model200Result }
  | { modelId: "202"; data: Model202Result }
  | { modelId: "347"; data: Model347Result }

export async function calculateTaxModel(
  companyId: string,
  modelId: string,
  periodParam?: string
): Promise<TaxModelCalculation | null> {
  switch (modelId) {
    case "303":
      return { modelId: "303", data: await calculateModel303(companyId, periodParam) }
    case "390":
      return {
        modelId: "390",
        data: await calculateModel390(companyId, periodParam ? Number(periodParam) : undefined),
      }
    case "130":
      return { modelId: "130", data: await calculateModel130(companyId, periodParam) }
    case "111":
      return { modelId: "111", data: await calculateModel111(companyId, periodParam) }
    case "190":
      return {
        modelId: "190",
        data: await calculateModel190(companyId, periodParam ? Number(periodParam) : undefined),
      }
    case "200":
      return {
        modelId: "200",
        data: await calculateModel200(companyId, periodParam ? Number(periodParam) : undefined),
      }
    case "202":
      return { modelId: "202", data: await calculateModel202(companyId, periodParam) }
    case "347":
      return {
        modelId: "347",
        data: await calculateModel347(companyId, periodParam ? Number(periodParam) : undefined),
      }
    default:
      return null
  }
}

export async function getTaxDashboardSummary(companyId: string) {
  const profile = await getTaxCompanyProfile(companyId)
  if (!profile) return null

  const period = getCurrentQuarterPeriod()
  const [m303, m130, m111, m347] = await Promise.all([
    calculateModel303(companyId, "current"),
    profile.taxEntityType === "AUTONOMO"
      ? calculateModel130(companyId, "current")
      : Promise.resolve(null),
    calculateModel111(companyId, "current"),
    calculateModel347(companyId, period.year),
  ])

  return { profile, period, m303, m130, m111, m347 }
}
