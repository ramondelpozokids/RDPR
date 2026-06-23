const PRODUCTION_FALLBACK = "https://rdpr-uzun.vercel.app"

function isLocalhostUrl(value: string | undefined): boolean {
  if (!value) return true
  return value.includes("localhost") || value.includes("127.0.0.1")
}

/** URL pública de la app para callbacks de Auth.js (local, preview y producción). */
export function resolveAuthBaseUrl(): string {
  const configured = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL

  if (process.env.VERCEL) {
    if (!isLocalhostUrl(configured)) return configured!

    const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
    if (production) return `https://${production}`

    const preview = process.env.VERCEL_URL
    if (preview) return `https://${preview}`

    return PRODUCTION_FALLBACK
  }

  return configured ?? "http://localhost:3000"
}

export function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? ""
}

/** Sincroniza AUTH_URL / NEXTAUTH_URL antes de inicializar Auth.js. */
export function ensureAuthEnv(): void {
  const url = resolveAuthBaseUrl()
  process.env.AUTH_URL = url
  process.env.NEXTAUTH_URL = url
}

export type AuthDiagnostics = {
  authUrl: string
  hasAuthSecret: boolean
  hasDatabase: boolean
  databaseOk: boolean
}

export function getAuthDiagnostics(): AuthDiagnostics {
  const db = process.env.DATABASE_URL ?? ""
  return {
    authUrl: resolveAuthBaseUrl(),
    hasAuthSecret: getAuthSecret().length >= 32,
    hasDatabase: db.length > 0,
    databaseOk: db.length > 0 && !db.includes("example.com"),
  }
}
