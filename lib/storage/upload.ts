import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { assertStorageConfigured, sanitizeStorageFileName } from "@/lib/storage/config"

let cachedClient: S3Client | null = null

function getClient(): S3Client {
  assertStorageConfigured()
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: process.env.STORAGE_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
      },
    })
  }
  return cachedClient
}

export type UploadBufferInput = {
  keyPrefix: string
  fileName: string
  body: Buffer
  contentType: string
}

/** Sube un buffer a R2/S3 y devuelve la URL pública. */
export async function uploadBuffer(input: UploadBufferInput): Promise<{ key: string; url: string }> {
  const safeName = sanitizeStorageFileName(input.fileName)
  const key = `${input.keyPrefix.replace(/\/+$/, "")}/${Date.now()}-${safeName}`
  const client = getClient()

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME!,
      Key: key,
      Body: input.body,
      ContentType: input.contentType || "application/octet-stream",
    })
  )

  const base = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL!.replace(/\/+$/, "")
  return { key, url: `${base}/${key}` }
}
