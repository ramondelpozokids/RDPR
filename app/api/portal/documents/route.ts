import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requirePortalContext } from "@/lib/portal/context"
import { isStorageConfigured, requiresRealStorage } from "@/lib/storage/config"
import { uploadBuffer } from "@/lib/storage/upload"

async function uploadFile(companyId: string, file: File) {
  if (requiresRealStorage() && !isStorageConfigured()) {
    throw new Error("STORAGE_NOT_CONFIGURED")
  }

  if (!isStorageConfigured()) {
    return `/dev-local/${companyId}/portal/${Date.now()}-${file.name}`
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const { url } = await uploadBuffer({
    keyPrefix: `${companyId}/portal`,
    fileName: file.name,
    body: buffer,
    contentType: file.type || "application/octet-stream",
  })
  return url
}

export async function GET() {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const [documents, folders] = await Promise.all([
    prisma.document.findMany({
      where: { companyId: ctx.companyId, customerId: ctx.customerId },
      orderBy: { createdAt: "desc" },
      include: { folder: { select: { name: true } } },
    }),
    prisma.documentFolder.findMany({
      where: { companyId: ctx.companyId, customerId: ctx.customerId },
      orderBy: { name: "asc" },
    }),
  ])

  return NextResponse.json({ success: true, data: { documents, folders } })
}

export async function POST(req: NextRequest) {
  const ctx = await requirePortalContext()
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const folderId = formData.get("folderId") as string | null

  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })

  let fileUrl: string
  try {
    fileUrl = await uploadFile(ctx.companyId, file)
  } catch (err) {
    if (err instanceof Error && err.message === "STORAGE_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Almacenamiento no configurado en el servidor." },
        { status: 503 }
      )
    }
    console.error("[portal/documents/upload]", err)
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
  }

  const document = await prisma.document.create({
    data: {
      companyId: ctx.companyId,
      customerId: ctx.customerId,
      folderId: folderId || null,
      name: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      source: "PORTAL",
    },
  })

  void import("@/lib/notifications/portal-upload").then(({ notifyPortalDocumentUpload }) =>
    notifyPortalDocumentUpload({
      companyId: ctx.companyId,
      customerId: ctx.customerId,
      customerName: ctx.customer.name,
      fileName: file.name,
    })
  )

  return NextResponse.json({ success: true, data: document }, { status: 201 })
}
