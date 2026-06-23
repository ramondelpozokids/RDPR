import { prisma } from "@/lib/prisma/client"
import { sendEmail } from "@/lib/email/send"
import { resolveAuthBaseUrl } from "@/lib/auth/env"

export async function notifyClientPendingDocs(params: {
  companyId: string
  customerId: string
  pendingLabels: string[]
}) {
  if (!params.pendingLabels.length) return { sent: false, reason: "nothing_pending" }

  const access = await prisma.clientPortalAccess.findFirst({
    where: { companyId: params.companyId, customerId: params.customerId },
    include: {
      user: { select: { email: true, name: true } },
      customer: { select: { name: true, email: true } },
      company: { select: { name: true } },
    },
  })

  const to = access?.user.email ?? access?.customer.email
  if (!to) return { sent: false, reason: "no_client_email" }

  const portalUrl = `${resolveAuthBaseUrl()}/portal/onboarding`
  const list = params.pendingLabels.map((l) => `<li>${l}</li>`).join("")

  await sendEmail({
    to: [to],
    subject: `Documentación pendiente — ${access?.customer.name ?? "su expediente"}`,
    html: `
      <p>Hola${access?.user.name ? ` ${access.user.name}` : ""},</p>
      <p>Su gestoría <strong>${access?.company.name ?? "RDPR OS"}</strong> necesita la siguiente documentación para completar su expediente:</p>
      <ul>${list}</ul>
      <p><a href="${portalUrl}">Acceder al portal y subir documentos</a></p>
      <p style="color:#666;font-size:12px">RDPR OS · notificación automática</p>
    `,
  })

  return { sent: true }
}
