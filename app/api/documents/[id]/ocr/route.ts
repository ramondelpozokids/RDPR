import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { enqueueOcrPipeline } from "@/lib/documents/ocr-pipeline"

type Props = { params: { id: string } }

export async function POST(_req: Request, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const doc = await prisma.document.findFirst({ where: { id: params.id, companyId } })
  if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await enqueueOcrPipeline(doc.id, companyId, doc.customerId)
  await new Promise((r) => setTimeout(r, 300))

  const result = await prisma.documentOcrResult.findUnique({ where: { documentId: doc.id } })
  const draft = await prisma.expenseDraft.findUnique({ where: { documentId: doc.id } })

  return NextResponse.json({ success: true, data: result, expenseDraft: draft })
}

export async function GET(_req: Request, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const doc = await prisma.document.findFirst({
    where: { id: params.id, companyId },
    include: { ocrResult: true },
  })
  if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  return NextResponse.json({ success: true, data: doc.ocrResult })
}
