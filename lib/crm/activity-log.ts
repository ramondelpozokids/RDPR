import { prisma } from "@/lib/prisma/client"

export type CustomerActivityEvent = {
  id: string
  at: Date
  kind: "log" | "document" | "task" | "message"
  title: string
  description?: string
  href?: string
}

export async function logCustomerActivity(params: {
  companyId: string
  customerId: string
  action: string
  entity: string
  entityId?: string
  userId?: string | null
  metadata?: Record<string, unknown>
}) {
  await prisma.activityLog.create({
    data: {
      companyId: params.companyId,
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      metadata: { customerId: params.customerId, ...params.metadata },
    },
  })
}

const LOG_LABELS: Record<string, string> = {
  PORTAL_DOCUMENT_UPLOAD: "Documento subido desde portal",
  OCR_EXPENSE_DRAFT: "IA detectó factura para revisión",
  CHECKLIST_UPDATED: "Checklist de onboarding actualizado",
  TASK_CREATED_AUTO: "Tarea automática creada",
  DOCUMENT_UPLOADED: "Documento subido",
}

export async function getCustomerActivityTimeline(
  companyId: string,
  customerId: string
): Promise<CustomerActivityEvent[]> {
  const [logs, documents, tasks, messages] = await Promise.all([
    prisma.activityLog.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.document.findMany({
      where: { companyId, customerId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, name: true, source: true, createdAt: true },
    }),
    prisma.customerTask.findMany({
      where: { companyId, customerId },
      orderBy: { updatedAt: "desc" },
      take: 15,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    prisma.portalMessage.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, body: true, authorRole: true, createdAt: true },
    }),
  ])

  const events: CustomerActivityEvent[] = []

  for (const log of logs) {
    const meta = log.metadata as { customerId?: string } | null
    if (meta?.customerId !== customerId) continue
    events.push({
      id: `log-${log.id}`,
      at: log.createdAt,
      kind: "log",
      title: LOG_LABELS[log.action] ?? log.action,
      description: log.entity,
    })
  }

  for (const doc of documents) {
    events.push({
      id: `doc-${doc.id}`,
      at: doc.createdAt,
      kind: "document",
      title: doc.source === "PORTAL" ? "Cliente subió documento" : "Documento añadido",
      description: doc.name,
      href: `/dashboard/crm/${customerId}?tab=documentos`,
    })
  }

  for (const task of tasks) {
    events.push({
      id: `task-${task.id}`,
      at: task.updatedAt,
      kind: "task",
      title: task.status === "DONE" ? "Tarea completada" : "Tarea pendiente",
      description: task.title,
      href: `/dashboard/crm/${customerId}?tab=tareas`,
    })
  }

  for (const msg of messages) {
    events.push({
      id: `msg-${msg.id}`,
      at: msg.createdAt,
      kind: "message",
      title: msg.authorRole === "CLIENT" ? "Mensaje del cliente" : "Respuesta gestoría",
      description: msg.body.slice(0, 120),
      href: `/dashboard/crm/${customerId}?tab=mensajes`,
    })
  }

  events.sort((a, b) => b.at.getTime() - a.at.getTime())
  const seen = new Set<string>()
  return events.filter((e) => {
    const key = `${e.kind}-${e.title}-${e.description}-${e.at.toISOString()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 40)
}
