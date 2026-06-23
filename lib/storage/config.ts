/** Comprueba si R2/S3 está configurado para subidas reales. */
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.STORAGE_ENDPOINT &&
      process.env.STORAGE_ACCESS_KEY_ID &&
      process.env.STORAGE_SECRET_ACCESS_KEY &&
      process.env.STORAGE_BUCKET_NAME &&
      process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
  )
}

/** En producción no se permiten URLs placeholder. */
export function requiresRealStorage(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
}

export function assertStorageConfigured(): void {
  if (!isStorageConfigured()) {
    throw new Error("STORAGE_NOT_CONFIGURED")
  }
}

export function sanitizeStorageFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
}
