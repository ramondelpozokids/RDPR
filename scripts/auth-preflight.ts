/**
 * Comprueba que la arquitectura de acceso sigue intacta.
 * Ejecutar en CI y antes de desplegar: npm run auth:check
 */
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const ROOT = resolve(__dirname, "..")

const REQUIRED_FILES = [
  "lib/auth/env.ts",
  "lib/auth/auth.config.ts",
  "lib/auth/config.ts",
  "lib/auth/actions.ts",
  "lib/auth/authorize-credentials.ts",
  "middleware.ts",
  "app/api/auth/[...nextauth]/route.ts",
  "app/(auth)/login/page.tsx",
] as const

const FORBIDDEN_PATTERNS: { file: string; pattern: RegExp; reason: string }[] = [
  {
    file: "middleware.ts",
    pattern: /from\s+["']@\/lib\/prisma/,
    reason: "El middleware no puede importar Prisma (Edge).",
  },
  {
    file: "middleware.ts",
    pattern: /from\s+["']@\/lib\/auth\/config["']/,
    reason: "El middleware debe usar auth.config.ts, no config.ts (Node + Prisma).",
  },
  {
    file: "lib/auth/auth.config.ts",
    pattern: /from\s+["']@\/lib\/prisma/,
    reason: "auth.config.ts debe ser Edge-safe (sin Prisma).",
  },
  {
    file: "app/(auth)/login/page.tsx",
    pattern: /from\s+["']next-auth\/react["'][\s\S]*signIn/,
    reason: "El login debe usar Server Action (lib/auth/actions), no signIn cliente.",
  },
]

function fail(message: string): never {
  console.error(`AUTH PREFLIGHT FAIL: ${message}`)
  process.exit(1)
}

function read(rel: string): string {
  const path = resolve(ROOT, rel)
  if (!existsSync(path)) fail(`Falta archivo obligatorio: ${rel}`)
  return readFileSync(path, "utf8")
}

console.log("Auth preflight…")

for (const file of REQUIRED_FILES) {
  read(file)
}

for (const rule of FORBIDDEN_PATTERNS) {
  const content = read(rule.file)
  if (rule.pattern.test(content)) {
    fail(`${rule.file}: ${rule.reason}`)
  }
}

const login = read("app/(auth)/login/page.tsx")
if (!login.includes("loginAction") || !login.includes('useFormState')) {
  fail("login/page.tsx debe usar loginAction + useFormState.")
}

const middleware = read("middleware.ts")
if (!middleware.includes("auth.config")) {
  fail("middleware.ts debe importar auth.config (patrón Auth.js v5).")
}

const route = read("app/api/auth/[...nextauth]/route.ts")
if (!route.includes('runtime = "nodejs"')) {
  fail("La ruta NextAuth debe declarar runtime nodejs.")
}

const envExample = read(".env.example")
for (const key of ["AUTH_SECRET", "AUTH_URL", "AUTH_TRUST_HOST", "DATABASE_URL", "DIRECT_URL"]) {
  if (!envExample.includes(key)) {
    fail(`.env.example debe documentar ${key}.`)
  }
}

console.log("AUTH PREFLIGHT OK")
