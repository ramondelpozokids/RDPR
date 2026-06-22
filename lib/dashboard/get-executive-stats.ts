import { prisma } from "@/lib/prisma/client"
import type { CompanyOption } from "@/lib/company/context"
import { syncOverdueInvoices } from "@/lib/invoices/sync-overdue"

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function quarterStart(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3) * 3
  return new Date(d.getFullYear(), q, 1)
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

export type ExecutiveAlert = {
  id: string
  type: "warning" | "info" | "danger"
  title: string
  description: string
  href?: string
}

export type CompanyBreakdownRow = {
  id: string
  name: string
  brandColor: string | null
  billedMonth: number
  paidMonth: number
  sharePct: number
}

export type MonthlyRevenue = {
  label: string
  year: number
  month: number
  total: number
}

export type ExecutiveStats = {
  billedMonth: number
  billedMonthDelta: number | null
  paidMonth: number
  paidMonthDelta: number | null
  pendingAmount: number
  pendingCount: number
  overdueCount: number
  overdueAmount: number
  estimatedVatQuarter: number
  netRevenueMonth: number
  totalCustomers: number
  activeProjects: number
  companyBreakdown: CompanyBreakdownRow[]
  monthlyRevenue: MonthlyRevenue[]
  alerts: ExecutiveAlert[]
  recentInvoices: Awaited<ReturnType<typeof fetchRecentInvoices>>
  recentCustomers: Awaited<ReturnType<typeof fetchRecentCustomers>>
}

async function fetchRecentInvoices(companyId: string) {
  return prisma.invoice.findMany({
    where: { companyId },
    select: {
      total: true,
      status: true,
      number: true,
      id: true,
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })
}

async function fetchRecentCustomers(companyId: string) {
  return prisma.customer.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, name: true, pipelineStage: true, createdAt: true },
  })
}

async function sumInvoices(where: Parameters<typeof prisma.invoice.aggregate>[0]["where"]) {
  const r = await prisma.invoice.aggregate({ where, _sum: { total: true, taxAmount: true } })
  return { total: r._sum.total ?? 0, tax: r._sum.taxAmount ?? 0 }
}

export async function getExecutiveStats(
  companyId: string,
  companies: CompanyOption[]
): Promise<ExecutiveStats> {
  await syncOverdueInvoices(companyId)

  const now = new Date()
  const thisMonth = monthStart(now)
  const lastMonth = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const lastMonthEnd = new Date(thisMonth.getTime() - 1)
  const qStart = quarterStart(now)

  const [
    issuedThis,
    issuedLast,
    paidThis,
    paidLast,
    pendingRows,
    overdueRows,
    taxQuarter,
    totalCustomers,
    activeProjects,
    recentInvoices,
    recentCustomers,
    overdueProjects,
    stalePending,
    paidSubtotalAgg,
  ] = await Promise.all([
    sumInvoices({ companyId, issueDate: { gte: thisMonth } }),
    sumInvoices({ companyId, issueDate: { gte: lastMonth, lte: lastMonthEnd } }),
    sumInvoices({ companyId, status: "PAID", paidAt: { gte: thisMonth } }),
    sumInvoices({ companyId, status: "PAID", paidAt: { gte: lastMonth, lte: lastMonthEnd } }),
    prisma.invoice.findMany({
      where: { companyId, status: "PENDING" },
      select: { total: true },
    }),
    prisma.invoice.findMany({
      where: { companyId, status: "OVERDUE" },
      select: { total: true },
    }),
    sumInvoices({ companyId, issueDate: { gte: qStart } }),
    prisma.customer.count({ where: { companyId } }),
    prisma.project.count({ where: { companyId, status: "IN_PROGRESS" } }),
    fetchRecentInvoices(companyId),
    fetchRecentCustomers(companyId),
    prisma.project.count({
      where: {
        companyId,
        status: "IN_PROGRESS",
        endDate: { lt: now },
      },
    }),
    prisma.invoice.count({
      where: {
        companyId,
        status: "PENDING",
        issueDate: { lt: new Date(now.getTime() - 30 * 86400000) },
      },
    }),
    prisma.invoice.aggregate({
      where: { companyId, status: "PAID", paidAt: { gte: thisMonth } },
      _sum: { subtotal: true },
    }),
  ])

  const pendingAmount = pendingRows.reduce((s, i) => s + i.total, 0)
  const overdueAmount = overdueRows.reduce((s, i) => s + i.total, 0)

  // Monthly revenue — last 6 months for active company
  const sixMonthsAgo = monthStart(new Date(now.getFullYear(), now.getMonth() - 5, 1))
  const monthInvoices = await prisma.invoice.findMany({
    where: { companyId, issueDate: { gte: sixMonthsAgo } },
    select: { total: true, issueDate: true },
  })

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const monthlyRevenue: MonthlyRevenue[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    const total = monthInvoices
      .filter((inv) => {
        const id = inv.issueDate
        return id.getFullYear() === y && id.getMonth() === m
      })
      .reduce((s, inv) => s + inv.total, 0)
    monthlyRevenue.push({ label: monthNames[m], year: y, month: m, total })
  }

  // Breakdown por empresa del grupo
  let companyBreakdown: CompanyBreakdownRow[] = []
  if (companies.length > 1) {
    const rows = await Promise.all(
      companies.map(async (c) => {
        const [billed, paid] = await Promise.all([
          sumInvoices({ companyId: c.id, issueDate: { gte: thisMonth } }),
          sumInvoices({ companyId: c.id, status: "PAID", paidAt: { gte: thisMonth } }),
        ])
        return { id: c.id, name: c.name, brandColor: c.brandColor, billedMonth: billed.total, paidMonth: paid.total }
      })
    )
    const groupPaid = rows.reduce((s, r) => s + r.paidMonth, 0)
    companyBreakdown = rows
      .map((r) => ({
        ...r,
        sharePct: groupPaid > 0 ? Math.round((r.paidMonth / groupPaid) * 100) : 0,
      }))
      .sort((a, b) => b.paidMonth - a.paidMonth)
  }

  const alerts: ExecutiveAlert[] = []
  if (overdueRows.length > 0) {
    alerts.push({
      id: "overdue",
      type: "danger",
      title: `${overdueRows.length} factura(s) vencida(s)`,
      description: `Tienes ${overdueRows.length} facturas vencidas por cobrar.`,
      href: "/dashboard/finance/invoicing",
    })
  }
  if (stalePending > 0) {
    alerts.push({
      id: "stale-pending",
      type: "warning",
      title: "Cobros pendientes antiguos",
      description: `${stalePending} factura(s) llevan más de 30 días sin cobrar.`,
      href: "/dashboard/finance/invoicing",
    })
  }
  if (overdueProjects > 0) {
    alerts.push({
      id: "overdue-projects",
      type: "warning",
      title: "Proyectos fuera de plazo",
      description: `${overdueProjects} proyecto(s) activos han superado la fecha de fin.`,
      href: "/dashboard/projects",
    })
  }
  if (totalCustomers === 0) {
    alerts.push({
      id: "no-customers",
      type: "info",
      title: "Añade tu primer cliente",
      description: "Empieza creando un cliente en el CRM para facturar y gestionar proyectos.",
      href: "/dashboard/crm/new",
    })
  }

  return {
    billedMonth: issuedThis.total,
    billedMonthDelta: pctChange(issuedThis.total, issuedLast.total),
    paidMonth: paidThis.total,
    paidMonthDelta: pctChange(paidThis.total, paidLast.total),
    pendingAmount,
    pendingCount: pendingRows.length,
    overdueCount: overdueRows.length,
    overdueAmount,
    estimatedVatQuarter: taxQuarter.tax,
    netRevenueMonth: paidSubtotalAgg._sum.subtotal ?? 0,
    totalCustomers,
    activeProjects,
    companyBreakdown,
    monthlyRevenue,
    alerts,
    recentInvoices,
    recentCustomers,
  }
}
