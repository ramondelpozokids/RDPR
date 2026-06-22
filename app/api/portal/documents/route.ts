import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requirePortalContext } from "@/lib/portal/context"

async function uploadFile(companyId: string, file: File) {
  let fileUrl = `/placeholder/${companyId}/${Date.now()}-${file.name}`

  if (process.env.STORAGE_ENDPOINT) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
    const client = new S3Client({
      region: "auto",
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
      },
    })
    const key = `${companyId}/portal/${Date.now()}-${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )
    fileUrl = `${process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL}/${key}`
  }

  return fileUrl
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

  const fileUrl = await uploadFile(ctx.companyId, file)

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
