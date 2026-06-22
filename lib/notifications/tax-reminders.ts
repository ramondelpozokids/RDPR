import { prisma } from "@/lib/prisma/client"
import { sendEmail } from "@/lib/email/send"
import { getCurrentQuarterPeriod } from "@/lib/tax/periods"

const REMINDER_DAYS = new Set([5, 12, 19])

/** Recordatorios orientativos de vencimientos fiscales trimestrales (303, 130/131). */
export async function sendTaxDeadlineReminders(): Promise<{ companies: number; emails: number }> {
  const today = new Date()
  const day = today.getDate()
  if (!REMINDER_DAYS.has(day)) {
    return { companies: 0, emails: 0 }
  }

  const period = getCurrentQuarterPeriod()
  const companies = await prisma.company.findMany({
    where: { email: { not: null } },
    select: { id: true, name: true, email: true, taxEntityType: true },
  })

  let emails = 0
  for (const company of companies) {
    if (!company.email) continue

    const models =
      company.taxEntityType === "AUTONOMO"
        ? "303 (IVA), 130/131 (IRPF)"
        : "303 (IVA), 111 (retenciones), 202 (pagos fraccionados IS)"

    const result = await sendEmail({
      to: company.email,
      subject: `Recordatorio fiscal RDPR — ${period.label}`,
      html: `
        <p>Recordatorio orientativo para <strong>${company.name}</strong>:</p>
        <p>Revise los modelos del periodo <strong>${period.label}</strong>: ${models}.</p>
        <p>Acceda a Tax Intelligence en RDPR OS para exportar estimaciones CSV.</p>
        <p style="color:#666;font-size:12px">No sustituye calendario oficial AEAT. Desactive configurando CRON sin ejecutar o sin RESEND_API_KEY.</p>
      `,
    })

    if (result.ok && !result.skipped) emails += 1
  }

  return { companies: companies.length, emails }
}
