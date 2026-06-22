import { prisma } from "@/lib/prisma/client"
import { getCompanyBrands } from "@/lib/brands/context"

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function yearStart(d = new Date()) {
  return new Date(d.getFullYear(), 0, 1)
}

export type BrandRevenueRow = {
  brandId: string | null
  name: string
  slug: string | null
  brandColor: string
  type: string | null
  emittedMonth: number
  collectedMonth: number
  emittedYear: number
  collectedYear: number
  pending: number
  invoiceCount: number
  sharePct: number
}

export type BrandRevenueReport = {
  rows: BrandRevenueRow[]
  totals: {
    emittedMonth: number
    collectedMonth: number
    emittedYear: number
    collectedYear: number
    pending: number
  }
  periodLabel: string
}

export async function getBrandRevenueReport(companyId: string): Promise<BrandRevenueReport> {
  const brands = await getCompanyBrands(companyId)
  const brandMap = new Map(brands.map((b) => [b.id, b]))

  const now = new Date()
  const mStart = monthStart(now)
  const yStart = yearStart(now)

  const invoices = await prisma.invoice.findMany({
    where: { companyId, status: { not: "CANCELLED" }, documentType: "INVOICE" },
    select: {
      brandId: true,
      total: true,
      status: true,
      issueDate: true,
      paidAt: true,
    },
  })

  const agg = new Map<
    string | null,
    {
      emittedMonth: number
      collectedMonth: number
      emittedYear: number
      collectedYear: number
      pending: number
      invoiceCount: number
    }
  >()

  function bucket(brandId: string | null) {
    return (
      agg.get(brandId) ?? {
        emittedMonth: 0,
        collectedMonth: 0,
        emittedYear: 0,
        collectedYear: 0,
        pending: 0,
        invoiceCount: 0,
      }
    )
  }

  for (const inv of invoices) {
    const b = bucket(inv.brandId)
    b.invoiceCount += 1

    if (inv.issueDate >= mStart) b.emittedMonth += inv.total
    if (inv.issueDate >= yStart) b.emittedYear += inv.total

    if (inv.status === "PAID" && inv.paidAt) {
      if (inv.paidAt >= mStart) b.collectedMonth += inv.total
      if (inv.paidAt >= yStart) b.collectedYear += inv.total
    }
    if (inv.status === "PENDING" || inv.status === "OVERDUE") {
      b.pending += inv.total
    }

    agg.set(inv.brandId, b)
  }

  const totalCollectedMonth = [...agg.values()].reduce((s, v) => s + v.collectedMonth, 0)

  const rows: BrandRevenueRow[] = []

  for (const brand of brands) {
    const stats = agg.get(brand.id) ?? {
      emittedMonth: 0,
      collectedMonth: 0,
      emittedYear: 0,
      collectedYear: 0,
      pending: 0,
      invoiceCount: 0,
    }
    rows.push({
      brandId: brand.id,
      name: brand.name,
      slug: brand.slug,
      brandColor: brand.brandColor,
      type: brand.type,
      ...stats,
      sharePct:
        totalCollectedMonth > 0 ? Math.round((stats.collectedMonth / totalCollectedMonth) * 100) : 0,
    })
    agg.delete(brand.id)
  }

  const unassigned = agg.get(null)
  if (unassigned && unassigned.invoiceCount > 0) {
    rows.push({
      brandId: null,
      name: "Sin marca asignada",
      slug: null,
      brandColor: "#94a3b8",
      type: null,
      ...unassigned,
      sharePct:
        totalCollectedMonth > 0
          ? Math.round((unassigned.collectedMonth / totalCollectedMonth) * 100)
          : 0,
    })
  }

  for (const [brandId, stats] of agg.entries()) {
    if (brandId === null) continue
    const orphan = brandMap.get(brandId)
    rows.push({
      brandId,
      name: orphan?.name ?? "Marca archivada",
      slug: orphan?.slug ?? null,
      brandColor: orphan?.brandColor ?? "#94a3b8",
      type: orphan?.type ?? null,
      ...stats,
      sharePct:
        totalCollectedMonth > 0 ? Math.round((stats.collectedMonth / totalCollectedMonth) * 100) : 0,
    })
  }

  rows.sort((a, b) => b.collectedMonth - a.collectedMonth)

  const totals = rows.reduce(
    (acc, r) => ({
      emittedMonth: acc.emittedMonth + r.emittedMonth,
      collectedMonth: acc.collectedMonth + r.collectedMonth,
      emittedYear: acc.emittedYear + r.emittedYear,
      collectedYear: acc.collectedYear + r.collectedYear,
      pending: acc.pending + r.pending,
    }),
    { emittedMonth: 0, collectedMonth: 0, emittedYear: 0, collectedYear: 0, pending: 0 }
  )

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  return {
    rows,
    totals,
    periodLabel: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
  }
}
