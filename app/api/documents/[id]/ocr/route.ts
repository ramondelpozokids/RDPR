import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import { extractDocumentOcr, fetchTextContent } from "@/lib/documents/ocr-extract"

type Props = { params: { id: string } }

export async function POST(_req: Request, { params }: Props) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const doc = await prisma.document.findFirst({ where: { id: params.id, companyId } })
  if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const textContent = await fetchTextContent(doc.fileUrl, doc.fileType)
  const extraction = extractDocumentOcr(doc.name, textContent)

  const result = await prisma.documentOcrResult.upsert({
    where: { documentId: doc.id },
    create: {
      documentId: doc.id,
      rawText: extraction.rawText,
      structured: extraction.structured,
    },
    update: {
      rawText: extraction.rawText,
      structured: extraction.structured,
    },
  })

  return NextResponse.json({ success: true, data: result })
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
