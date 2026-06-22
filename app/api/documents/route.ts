// app/api/documents/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

// GET /api/documents
export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get("customerId")
  const projectId  = searchParams.get("projectId")

  const documents = await prisma.document.findMany({
    where: {
      companyId,
      ...(customerId && { customerId }),
      ...(projectId  && { projectId  }),
    },
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } }, project: { select: { name: true } } },
  })

  return NextResponse.json({ success: true, data: documents })
}

// POST /api/documents  — recibe multipart/form-data
export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const formData   = await req.formData()
  const file       = formData.get("file") as File | null
  const customerId = formData.get("customerId") as string | null
  const projectId  = formData.get("projectId")  as string | null

  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })

  // ── Subir a S3 / R2 ──────────────────────────
  // Si STORAGE_ENDPOINT está configurado, subimos al bucket real.
  // En desarrollo, guardamos solo los metadatos con una URL placeholder.
  let fileUrl = `/placeholder/${companyId}/${Date.now()}-${file.name}`

  if (process.env.STORAGE_ENDPOINT) {
    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
      const client = new S3Client({
        region:   "auto",
        endpoint: process.env.STORAGE_ENDPOINT,
        credentials: {
          accessKeyId:     process.env.STORAGE_ACCESS_KEY_ID!,
          secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
        },
      })
      const key    = `${companyId}/${Date.now()}-${file.name}`
      const buffer = Buffer.from(await file.arrayBuffer())

      await client.send(new PutObjectCommand({
        Bucket:      process.env.STORAGE_BUCKET_NAME!,
        Key:         key,
        Body:        buffer,
        ContentType: file.type,
      }))

      fileUrl = `${process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL}/${key}`
    } catch (err) {
      console.error("[documents/upload]", err)
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
    }
  }

  const document = await prisma.document.create({
    data: {
      companyId,
      customerId: customerId || null,
      projectId:  projectId  || null,
      name:       file.name,
      fileUrl,
      fileType:   file.type,
      fileSize:   file.size,
    },
  })

  return NextResponse.json({ success: true, data: document }, { status: 201 })
}
