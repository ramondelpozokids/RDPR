import { createCipheriv, randomBytes, scryptSync } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

const ALGO = "aes-256-gcm"
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15 MB

function getKey(): Buffer {
  const secret = process.env.DOCUMENT_ENCRYPTION_SECRET || process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("DOCUMENT_ENCRYPTION_SECRET o AUTH_SECRET requerido para cifrado")
  }
  return scryptSync(secret, "rdpr-secure-upload-v1", 32)
}

function storageDir() {
  return process.env.VERCEL
    ? path.join("/tmp", "rdpr-secure-uploads")
    : path.join(process.cwd(), "storage", "secure-uploads")
}

export type EncryptedFileResult = {
  storageKey: string
  iv: string
  authTag: string
  fileSize: number
}

export async function encryptAndStoreFile(
  buffer: Buffer,
  originalName: string
): Promise<EncryptedFileResult> {
  if (buffer.length > MAX_FILE_BYTES) {
    throw new Error("El archivo supera el límite de 15 MB")
  }

  const iv = randomBytes(12)
  const key = getKey()
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  const authTag = cipher.getAuthTag()

  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
  const storageKey = `${Date.now()}-${randomBytes(4).toString("hex")}-${safeName}`

  const dir = storageDir()
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, storageKey), encrypted)

  return {
    storageKey,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    fileSize: buffer.length,
  }
}

export { MAX_FILE_BYTES }
