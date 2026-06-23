import { NextRequest, NextResponse } from "next/server"
import { requirePortalContext } from "@/lib/portal/context"
import { answerPortalFaq } from "@/lib/portal/faq"

export async function POST(req: NextRequest) {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { question } = await req.json().catch(() => ({}))
  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "Pregunta requerida" }, { status: 400 })
  }

  return NextResponse.json({ success: true, answer: answerPortalFaq(question) })
}
