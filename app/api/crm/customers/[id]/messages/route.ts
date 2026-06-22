import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { auth } from "@/lib/auth/config"
import { notifyClientPortalReply } from "@/lib/notifications/portal-message"

const postSchema = z.object({
  body: z.string().min(1).max(4000),
})

type Props = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, companyId },
  })
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const messages = await prisma.portalMessage.findMany({
    where: { companyId, customerId: params.id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } } },
  })

  await prisma.portalMessage.updateMany({
    where: {
      companyId,
      customerId: params.id,
      authorRole: "CLIENT",
      readAt: null,
    },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ success: true, data: messages })
}

export async function POST(req: NextRequest, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, companyId },
  })
  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const parsed = postSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 })

  const message = await prisma.portalMessage.create({
    data: {
      companyId,
      customerId: params.id,
      authorId: session.user.id,
      authorRole: "ADVISOR",
      body: parsed.data.body.trim(),
    },
    include: { author: { select: { name: true } } },
  })

  void notifyClientPortalReply({
    customerId: params.id,
    customerName: customer.name,
    preview: message.body,
  })

  return NextResponse.json({ success: true, data: message }, { status: 201 })
}
