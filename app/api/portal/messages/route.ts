import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { requirePortalContext } from "@/lib/portal/context"
import { auth } from "@/lib/auth/config"
import { notifyPortalMessage } from "@/lib/notifications/portal-message"

const postSchema = z.object({
  body: z.string().min(1).max(4000),
})

export async function GET() {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const messages = await prisma.portalMessage.findMany({
    where: { companyId: ctx.companyId, customerId: ctx.customerId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json({ success: true, data: messages })
}

export async function POST(req: NextRequest) {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = postSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 })

  const message = await prisma.portalMessage.create({
    data: {
      companyId: ctx.companyId,
      customerId: ctx.customerId,
      authorId: session.user.id,
      authorRole: "CLIENT",
      body: parsed.data.body.trim(),
    },
    include: { author: { select: { name: true } } },
  })

  void notifyPortalMessage({
    companyId: ctx.companyId,
    customerId: ctx.customerId,
    customerName: ctx.customer.name,
    preview: message.body,
    fromClient: true,
  })

  return NextResponse.json({ success: true, data: message }, { status: 201 })
}
