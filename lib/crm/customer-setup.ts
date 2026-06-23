import { prisma } from "@/lib/prisma/client"

const DEFAULT_FOLDERS = [
  "Fiscal",
  "Contratos",
  "Nóminas",
  "Identidad",
  "Facturas recibidas",
]

const DEFAULT_ONBOARDING_TASKS = [
  { title: "Completar datos fiscales del cliente", type: "REVIEW" as const, priority: "HIGH" as const },
  { title: "Solicitar DNI/NIE o escrituras", type: "DOCUMENT_REQUEST" as const, priority: "HIGH" as const },
  { title: "Firmar autorización para actuar", type: "DOCUMENT_REQUEST" as const, priority: "URGENT" as const },
  { title: "Revisar documentación inicial", type: "REVIEW" as const, priority: "MEDIUM" as const },
]

const DEFAULT_CHECKLIST = [
  { id: "profile", label: "Datos fiscales completos", done: false },
  { id: "identity", label: "DNI/NIE o escrituras", done: false },
  { id: "authorization", label: "Autorización firmada", done: false },
  { id: "bank", label: "Conexión bancaria", done: false },
  { id: "portal", label: "Acceso portal activado", done: false },
]

/** Crea perfil, carpetas y tareas de onboarding al dar de alta un cliente. */
export async function setupNewCustomer(customerId: string, companyId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.customerProfile.create({
      data: {
        customerId,
        checklist: DEFAULT_CHECKLIST,
        onboardingStatus: "PENDING",
      },
    })
    for (const name of DEFAULT_FOLDERS) {
      await tx.documentFolder.create({ data: { companyId, customerId, name } })
    }
    for (const t of DEFAULT_ONBOARDING_TASKS) {
      await tx.customerTask.create({
        data: {
          companyId,
          customerId,
          title: t.title,
          type: t.type,
          priority: t.priority,
          status: "TODO",
        },
      })
    }
  })
}
