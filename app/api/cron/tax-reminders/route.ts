import { NextRequest, NextResponse } from "next/server"
import { sendTaxDeadlineReminders } from "@/lib/notifications/tax-reminders"

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 })
  }

  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const data = await sendTaxDeadlineReminders()
  return NextResponse.json({ success: true, data })
}
