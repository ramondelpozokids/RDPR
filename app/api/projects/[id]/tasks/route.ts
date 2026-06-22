// app/api/projects/[id]/tasks/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const taskSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  priority:    z.enum(["LOW","MEDIUM","HIGH","URGENT"]).default("MEDIUM"),
  status:      z.enum(["TODO","IN_PROGRESS","DONE"]).default("TODO"),
  dueDate:     z.string().optional(),
  assignedTo:  z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const project = await prisma.project.findFirst({ where: { id: params.id, companyId } })
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const tasks = await prisma.task.findMany({
    where:   { projectId: params.id },
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ success: true, data: tasks })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const project = await prisma.project.findFirst({ where: { id: params.id, companyId } })
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const body   = await req.json()
  const parsed = taskSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const task = await prisma.task.create({
    data: {
      projectId: params.id,
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  })

  return NextResponse.json({ success: true, data: task }, { status: 201 })
}
