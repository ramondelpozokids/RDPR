import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { CONTACT_EMAIL } from "@/lib/site/config"

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos del formulario inválidos" }, { status: 400 })
    }

    const inquiry = await prisma.contactInquiry.create({ data: parsed.data })

    console.info("[contact]", {
      id: inquiry.id,
      to: CONTACT_EMAIL,
      from: parsed.data.email,
      subject: parsed.data.subject,
    })

    return NextResponse.json({ success: true, id: inquiry.id })
  } catch (err) {
    console.error("[contact]", err)
    return NextResponse.json({ error: "No se pudo enviar la consulta" }, { status: 500 })
  }
}
