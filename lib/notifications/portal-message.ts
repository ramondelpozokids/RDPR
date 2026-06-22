import { sendEmail } from "@/lib/email/send"
import { prisma } from "@/lib/prisma/client"

export async function notifyPortalMessage(params: {
  companyId: string
  customerId: string
  customerName: string
  preview: string
  fromClient: boolean
}) {
  const company = await prisma.company.findUnique({
    where: { id: params.companyId },
    select: {
      email: true,
      users: { take: 3, include: { user: { select: { email: true } } } },
    },
  })

  const targets = new Set<string>()
  if (company?.email) targets.add(company.email)
  for (const uc of company?.users ?? []) {
    if (uc.user.email) targets.add(uc.user.email)
  }

  if (!targets.size) return

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://rdpr-uzun.vercel.app"
  const subject = params.fromClient
    ? `Nuevo mensaje portal — ${params.customerName}`
    : `Respuesta enviada a ${params.customerName}`

  await sendEmail({
    to: [...targets],
    subject,
    html: `
      <p>${params.fromClient ? "El cliente" : "La asesoría"} <strong>${params.customerName}</strong> ha escrito en el portal:</p>
      <blockquote style="border-left:3px solid #6570f3;padding-left:12px;color:#444">${params.preview.slice(0, 500)}</blockquote>
      <p><a href="${baseUrl}/dashboard/crm/${params.customerId}?tab=mensajes">Abrir conversación</a></p>
    `,
  })
}

export async function notifyClientPortalReply(params: {
  customerId: string
  customerName: string
  preview: string
}) {
  const access = await prisma.clientPortalAccess.findFirst({
    where: { customerId: params.customerId },
    include: { user: { select: { email: true } } },
  })
  if (!access?.user.email) return

  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://rdpr-uzun.vercel.app"

  await sendEmail({
    to: access.user.email,
    subject: `Su asesoría ha respondido — ${params.customerName}`,
    html: `
      <p>Tiene un nuevo mensaje en el portal cliente:</p>
      <blockquote style="border-left:3px solid #6570f3;padding-left:12px;color:#444">${params.preview.slice(0, 500)}</blockquote>
      <p><a href="${baseUrl}/portal/mensajes">Ver mensajes</a></p>
    `,
  })
}
