import { prisma } from "@/lib/prisma/client"
import { sendEmail } from "@/lib/email/send"

export async function notifyPortalDocumentUpload(params: {
  companyId: string
  customerId: string
  customerName: string
  fileName: string
}) {
  const company = await prisma.company.findUnique({
    where: { id: params.companyId },
    select: {
      name: true,
      email: true,
      users: {
        take: 3,
        include: { user: { select: { email: true, name: true } } },
      },
    },
  })

  const targets = new Set<string>()
  if (company?.email) targets.add(company.email)
  for (const uc of company?.users ?? []) {
    if (uc.user.email) targets.add(uc.user.email)
  }

  if (!targets.size) return { sent: false, reason: "no_recipients" }

  const dashboardUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://rdpr-uzun.vercel.app"

  await sendEmail({
    to: [...targets],
    subject: `Nuevo documento en portal — ${params.customerName}`,
    html: `
      <p>El cliente <strong>${params.customerName}</strong> ha subido un documento al portal:</p>
      <p><strong>${params.fileName}</strong></p>
      <p><a href="${dashboardUrl}/dashboard/crm/${params.customerId}?tab=documentos">Ver expediente</a></p>
      <p style="color:#666;font-size:12px">RDPR OS · notificación automática</p>
    `,
  })

  await prisma.activityLog.create({
    data: {
      companyId: params.companyId,
      action: "PORTAL_DOCUMENT_UPLOAD",
      entity: "Document",
      metadata: {
        customerId: params.customerId,
        customerName: params.customerName,
        fileName: params.fileName,
      },
    },
  })

  return { sent: true }
}
