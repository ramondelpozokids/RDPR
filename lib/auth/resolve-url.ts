/** URL base de Auth.js en Vercel (evita callbacks a localhost en producción). */
export function resolveAuthBaseUrl(): string {
  const configured = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL

  const isLocalhost =
    !configured ||
    configured.includes("localhost") ||
    configured.includes("127.0.0.1")

  if (process.env.VERCEL && isLocalhost) {
    const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
    if (production) return `https://${production}`
    const preview = process.env.VERCEL_URL
    if (preview) return `https://${preview}`
    return "https://rdpr-uzun.vercel.app"
  }

  return configured ?? "http://localhost:3000"
}

/** Fija AUTH_URL/NEXTAUTH_URL antes de inicializar NextAuth. */
export function ensureAuthEnv() {
  const url = resolveAuthBaseUrl()
  if (process.env.VERCEL || !process.env.AUTH_URL) {
    process.env.AUTH_URL = url
  }
  if (process.env.VERCEL || !process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = url
  }
}
