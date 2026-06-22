// app/api/projects/[id]/tasks/[taskId]/route.ts
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

async function verifyAccess(projectId: string, companyId: string) {
  return prisma.project.findFirst({ where: { id: projectId, companyId } })
}

// PATCH /api/projects/:id/tasks/:taskId
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const companyId = await getCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const project = await verifyAccess(params.id, companyId)
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body   = await req.json()
  const schema = z.object({
    title:       z.string().min(1).optional(),
    description: z.string().optional(),
    priority:    z.enum(["LOW","MEDIUM","HIGH","URGENT"]).optional(),
    status:      z.enum(["TODO","IN_PROGRESS","DONE"]).optional(),
    dueDate:     z.string().nullable().optional(),
    assignedTo:  z.string().nullable().optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const task = await prisma.task.findFirst({
    where: { id: params.taskId, projectId: params.id },
  })
  if (!task) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })

  const updated = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate !== undefined
        ? parsed.data.dueDate ? new Date(parsed.data.dueDate) : null
        : undefined,
    },
  })

  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/projects/:id/tasks/:taskId
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const companyId = await getCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const project = await verifyAccess(params.id, companyId)
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.task.deleteMany({ where: { id: params.taskId, projectId: params.id } })
  return NextResponse.json({ success: true })
}
