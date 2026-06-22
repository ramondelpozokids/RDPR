export type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
}

export type SendEmailResult = {
  ok: boolean
  skipped?: boolean
  id?: string
  error?: string
}

function recipients(to: string | string[]): string[] {
  return (Array.isArray(to) ? to : [to]).filter(Boolean)
}

/** Envía email vía Resend si RESEND_API_KEY está configurada; si no, registra en log (dev). */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = recipients(input.to)
  if (!to.length) return { ok: false, error: "Sin destinatarios" }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info("[email:skipped]", { to, subject: input.subject })
    return { ok: true, skipped: true }
  }

  const from = process.env.EMAIL_FROM ?? "RDPR OS <onboarding@resend.dev>"

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: input.subject,
        html: input.html,
      }),
    })

    const json = (await res.json()) as { id?: string; message?: string }
    if (!res.ok) {
      return { ok: false, error: json.message ?? `HTTP ${res.status}` }
    }
    return { ok: true, id: json.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de envío" }
  }
}
