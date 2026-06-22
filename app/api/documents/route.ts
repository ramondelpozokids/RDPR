import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

function parseTagsParam(raw: string | null): string[] | undefined {
  if (!raw?.trim()) return undefined
  return raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
}

// GET /api/documents
export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get("customerId")
  const projectId = searchParams.get("projectId")
  const folderId = searchParams.get("folderId")
  const q = searchParams.get("q")?.trim()
  const tag = searchParams.get("tag")?.trim().toLowerCase()
  const tags = parseTagsParam(searchParams.get("tags"))
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const createdAt: { gte?: Date; lte?: Date } = {}
  if (from) {
    const d = new Date(from)
    if (!Number.isNaN(d.getTime())) createdAt.gte = d
  }
  if (to) {
    const d = new Date(to)
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999)
      createdAt.lte = d
    }
  }

  const documents = await prisma.document.findMany({
    where: {
      companyId,
      ...(customerId && { customerId }),
      ...(projectId && { projectId }),
      ...(folderId && { folderId }),
      ...(Object.keys(createdAt).length > 0 && { createdAt }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
          { customer: { name: { contains: q, mode: "insensitive" } } },
          { project: { name: { contains: q, mode: "insensitive" } } },
        ],
      }),
      ...(tag && { tags: { has: tag } }),
      ...(tags?.length && { tags: { hasEvery: tags } }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      project: { select: { name: true } },
      folder: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ success: true, data: documents })
}

// POST /api/documents  — recibe multipart/form-data
export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const customerId = formData.get("customerId") as string | null
  const projectId = formData.get("projectId") as string | null
  const folderId = formData.get("folderId") as string | null
  const tagsRaw = formData.get("tags") as string | null

  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
    : []

  let fileUrl = `/placeholder/${companyId}/${Date.now()}-${file.name}`

  if (process.env.STORAGE_ENDPOINT) {
    try {
      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
      const client = new S3Client({
        region: "auto",
        endpoint: process.env.STORAGE_ENDPOINT,
        credentials: {
          accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
          secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
        },
      })
      const key = `${companyId}/${Date.now()}-${file.name}`
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
    } catch (err) {
      console.error("[documents/upload]", err)
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
    }
  }

  const document = await prisma.document.create({
    data: {
      companyId,
      customerId: customerId || null,
      projectId: projectId || null,
      folderId: folderId || null,
      name: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      tags,
      source: "INTERNAL",
    },
    include: {
      folder: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ success: true, data: document }, { status: 201 })
}
