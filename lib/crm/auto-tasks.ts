import { prisma } from "@/lib/prisma/client"
import type { ChecklistItem } from "@/lib/crm/checklist-sync"
import { logCustomerActivity } from "@/lib/crm/activity-log"
import { notifyClientPendingDocs } from "@/lib/notifications/pending-docs"

export async function ensureOcrReviewTask(params: {
  companyId: string
  customerId: string
  documentId: string
  documentName: string
}) {
  const title = `Revisar factura (IA): ${params.documentName}`
  const existing = await prisma.customerTask.findFirst({
    where: {
      companyId: params.companyId,
      customerId: params.customerId,
      status: { not: "DONE" },
      title,
    },
  })
  if (existing) return existing

  const task = await prisma.customerTask.create({
    data: {
      companyId: params.companyId,
      customerId: params.customerId,
      title,
      type: "REVIEW",
      priority: "HIGH",
      status: "TODO",
    },
  })

  await logCustomerActivity({
    companyId: params.companyId,
    customerId: params.customerId,
    action: "TASK_CREATED_AUTO",
    entity: "CustomerTask",
    entityId: task.id,
    metadata: { title },
  })

  return task
}

export async function syncMissingDocTasks(
  companyId: string,
  customerId: string,
  checklist: ChecklistItem[]
) {
  const pending = checklist.filter((c) => !c.done)
  if (!pending.length) return

  for (const item of pending) {
    const title = `Solicitar: ${item.label}`
    const exists = await prisma.customerTask.findFirst({
      where: {
        companyId,
        customerId,
        status: { not: "DONE" },
        title,
      },
    })
    if (exists) continue

    const task = await prisma.customerTask.create({
      data: {
        companyId,
        customerId,
        title,
        type: "DOCUMENT_REQUEST",
        priority: "HIGH",
        status: "TODO",
      },
    })

    await logCustomerActivity({
      companyId,
      customerId,
      action: "TASK_CREATED_AUTO",
      entity: "CustomerTask",
      entityId: task.id,
      metadata: { title, checklistItem: item.id },
    })
  }

  await notifyClientPendingDocs({
    companyId,
    customerId,
    pendingLabels: pending.map((p) => p.label),
  })
}
