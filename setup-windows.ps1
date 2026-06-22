# ─────────────────────────────────────────────────────────────
# RDPR OS - Script de instalación para Windows
# Ejecuta este script en PowerShell como Administrador
# ─────────────────────────────────────────────────────────────

$dest = "C:\Users\X\Desktop\RDPR-OS"

Write-Host ""
Write-Host "🚀 Creando proyecto RDPR OS en $dest" -ForegroundColor Cyan
Write-Host ""

# ── 1. Crear estructura de carpetas ───────────────────────────
$folders = @(
  "app\(auth)\login",
  "app\(auth)\register",
  "app\(dashboard)\crm",
  "app\(dashboard)\projects",
  "app\(dashboard)\invoices",
  "app\(dashboard)\documents",
  "app\(dashboard)\settings",
  "app\api\auth\register",
  "app\api\customers",
  "app\api\projects",
  "app\api\invoices",
  "app\api\documents",
  "components\ui",
  "components\layout",
  "components\modules\crm",
  "components\modules\projects",
  "components\modules\invoices",
  "components\modules\documents",
  "lib\prisma",
  "lib\auth",
  "lib\stripe",
  "lib\storage",
  "lib\utils",
  "prisma\migrations",
  "public\assets",
  "types",
  "hooks",
  "styles"
)

foreach ($f in $folders) {
  New-Item -ItemType Directory -Force -Path "$dest\$f" | Out-Null
}

Write-Host "  ✅ Carpetas creadas" -ForegroundColor Green

# ── 2. Descargar node_modules: instalar después de pegar archivos
Write-Host "  ℹ️  Recuerda ejecutar 'npm install' tras copiar los archivos" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Estructura RDPR-OS lista en $dest" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor White
Write-Host "  1. Copia los archivos descargados dentro de $dest"
Write-Host "  2. Renombra .env.example a .env.local y configura las variables"
Write-Host "  3. Ejecuta: npm install"
Write-Host "  4. Ejecuta: npm run db:generate"
Write-Host "  5. Ejecuta: npm run db:push"
Write-Host "  6. Ejecuta: npm run dev"
Write-Host ""
Write-Host "🌐 Abre http://localhost:3000 en tu navegador" -ForegroundColor Cyan
