// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { auth }   from "@/lib/auth/config"

async function getCompanyId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const uc = await prisma.userCompany.findFirst({
    where: { userId: session.user.id as string },
    select: { companyId: true },
  })
  return uc?.companyId ?? null
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await getCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const project = await prisma.project.findFirst({
    where:   { id: params.id, companyId },
    include: { customer: true, tasks: { include: { assignee: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } } },
  })
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  return NextResponse.json({ success: true, data: project })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await getCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const schema = z.object({
    name:        z.string().min(1).optional(),
    description: z.string().optional(),
    status:      z.enum(["PENDING","IN_PROGRESS","COMPLETED","CANCELLED"]).optional(),
    customerId:  z.string().nullable().optional(),
    startDate:   z.string().nullable().optional(),
    endDate:     z.string().nullable().optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const project = await prisma.project.findFirst({ where: { id: params.id, companyId } })
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate !== undefined
        ? parsed.data.startDate ? new Date(parsed.data.startDate) : null : undefined,
      endDate: parsed.data.endDate !== undefined
        ? parsed.data.endDate ? new Date(parsed.data.endDate) : null : undefined,
    },
    include: { customer: true },
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await getCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const project = await prisma.project.findFirst({ where: { id: params.id, companyId } })
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  // Cascade: tasks deleted by Prisma relation
  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
