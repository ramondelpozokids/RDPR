import { prisma } from "@/lib/prisma/client"
import { getUpcomingFiscalDeadlines } from "@/lib/gestoria/fiscal-deadlines"

export type ExpedienteRow = {
  customerId: string
  customerName: string
  taxId: string | null
  onboardingStatus: string
  openTasks: number
  openIncidents: number
  pendingDocs: number
  nextDeadline: { label: string; dueDate: Date } | null
  health: "ok" | "warning" | "critical"
}

export type GestoriaCommandCenter = {
  activeClients: number
  pendingTasks: number
  openIncidents: number
  portalDocumentsPending: number
  upcomingDeadlines: { customerId: string; customerName: string; label: string; dueDate: Date }[]
  expedientes: ExpedienteRow[]
  alerts: { id: string; type: "warning" | "danger" | "info"; title: string; description: string; href?: string }[]
}

export async function getGestoriaCommandCenter(companyId: string): Promise<GestoriaCommandCenter> {
  const now = new Date()
  const weekAhead = new Date(now.getTime() + 7 * 86400000)

  const customers = await prisma.customer.findMany({
    where: { companyId, pipelineStage: "CLIENT_WON" },
    include: {
      profile: true,
      tasks: { where: { status: { not: "DONE" } } },
      incidents: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } } },
      _count: {
        select: {
          documents: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })

  const portalDocsPending = await prisma.document.count({
    where: { companyId, source: "PORTAL", createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } },
  })

  const pendingOcrReview = await prisma.expenseDraft.count({
    where: { companyId, status: "PENDING_REVIEW" },
  })

  const pendingTasks = await prisma.customerTask.count({
    where: { companyId, status: { not: "DONE" } },
  })

  const openIncidents = await prisma.customerIncident.count({
    where: { companyId, status: { in: ["OPEN", "IN_PROGRESS"] } },
  })

  const overdueTasks = await prisma.customerTask.count({
    where: { companyId, status: { not: "DONE" }, dueDate: { lt: now } },
  })

  const expedientes: ExpedienteRow[] = []
  const upcomingDeadlines: GestoriaCommandCenter["upcomingDeadlines"] = []

  for (const c of customers) {
    const profile = c.profile ?? {
      entityType: "AUTONOMO" as const,
      vatFilingPeriod: "QUARTERLY" as const,
      onboardingStatus: "PENDING",
    }

    const deadlines = getUpcomingFiscalDeadlines(
      { entityType: profile.entityType, vatFilingPeriod: profile.vatFilingPeriod },
      now,
      60
    )
    const next = deadlines[0] ?? null

    if (next && next.dueDate <= weekAhead) {
      upcomingDeadlines.push({
        customerId: c.id,
        customerName: c.name,
        label: next.label,
        dueDate: next.dueDate,
      })
    }

    const openTasks = c.tasks.length
    const openInc = c.incidents.length
    const onboardingIncomplete = profile.onboardingStatus !== "COMPLETE"

    let health: ExpedienteRow["health"] = "ok"
    if (openInc > 0 || c.tasks.some((t) => t.priority === "URGENT")) health = "critical"
    else if (openTasks > 3 || onboardingIncomplete) health = "warning"

    expedientes.push({
      customerId: c.id,
      customerName: c.name,
      taxId: c.taxId,
      onboardingStatus: profile.onboardingStatus,
      openTasks,
      openIncidents: openInc,
      pendingDocs: c._count.documents,
      nextDeadline: next ? { label: next.label, dueDate: next.dueDate } : null,
      health,
    })
  }

  upcomingDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

  const alerts: GestoriaCommandCenter["alerts"] = []

  if (overdueTasks > 0) {
    alerts.push({
      id: "overdue-tasks",
      type: "danger",
      title: `${overdueTasks} tarea(s) vencida(s)`,
      description: "Hay tareas de clientes con fecha límite superada.",
      href: "/dashboard/crm",
    })
  }
  if (openIncidents > 0) {
    alerts.push({
      id: "open-incidents",
      type: "warning",
      title: `${openIncidents} incidencia(s) abiertas`,
      description: "Revisa los expedientes con incidencias activas.",
      href: "/dashboard/crm",
    })
  }
  if (portalDocsPending > 0) {
    alerts.push({
      id: "portal-docs",
      type: "info",
      title: `${portalDocsPending} documento(s) del portal`,
      description: "Documentos subidos por clientes en los últimos 30 días.",
      href: "/dashboard/documents",
    })
  }
  if (pendingOcrReview > 0) {
    alerts.push({
      id: "ocr-review",
      type: "info",
      title: `${pendingOcrReview} factura(s) por revisar (OCR)`,
      description: "La IA detectó gastos que requieren aprobación del gestor.",
      href: "/dashboard/documents/review",
    })
  }
  if (upcomingDeadlines.length > 0) {
    alerts.push({
      id: "tax-deadlines",
      type: "warning",
      title: `${upcomingDeadlines.length} vencimiento(s) fiscal(es) esta semana`,
      description: "Impuestos próximos en expedientes de clientes.",
      href: "/dashboard/crm",
    })
  }

  return {
    activeClients: customers.length,
    pendingTasks,
    openIncidents,
    portalDocumentsPending: portalDocsPending,
    upcomingDeadlines: upcomingDeadlines.slice(0, 8),
    expedientes,
    alerts,
  }
}
