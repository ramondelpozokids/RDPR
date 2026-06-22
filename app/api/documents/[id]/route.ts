// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

// PATCH /api/documents/:id — rename or reassign
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const schema = z.object({
    name:       z.string().min(1).optional(),
    customerId: z.string().nullable().optional(),
    projectId:  z.string().nullable().optional(),
    folderId:   z.string().nullable().optional(),
    tags:       z.array(z.string()).optional(),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const doc = await prisma.document.findFirst({ where: { id: params.id, companyId } })
  if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const updated = await prisma.document.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.tags && {
        tags: parsed.data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
      }),
    },
  })
  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/documents/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const doc = await prisma.document.findFirst({ where: { id: params.id, companyId } })
  if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await prisma.document.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
