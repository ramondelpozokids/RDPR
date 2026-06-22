import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"
import { encryptAndStoreFile, MAX_FILE_BYTES } from "@/lib/crypto/secure-file"

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
])

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()

    const meta = z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email().max(180),
      })
      .safeParse({ name, email })

    if (!meta.success) {
      return NextResponse.json({ error: "Nombre y email válidos requeridos" }, { status: 400 })
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Archivo demasiado grande (máx. 15 MB)" }, { status: 400 })
    }

    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Use PDF, imágenes o Office." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const encrypted = await encryptAndStoreFile(buffer, file.name)

    const record = await prisma.secureUpload.create({
      data: {
        uploaderName: meta.data.name,
        uploaderEmail: meta.data.email,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: encrypted.fileSize,
        storageKey: encrypted.storageKey,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
      },
    })

    return NextResponse.json(
      {
        success: true,
        id: record.id,
        message: "Documento recibido y cifrado correctamente",
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("[secure-upload]", err)
    const msg = err instanceof Error ? err.message : "Error al procesar el archivo"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
