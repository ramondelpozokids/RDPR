import { PrismaClient } from "@prisma/client"
import { ensureChartOfAccounts } from "../lib/accounting/journal"
import { ensureCompanyBrands, ensureRdprLegalEntity } from "../lib/brands/ensure"

const prisma = new PrismaClient()

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "info@ramondelpozorott.es"

async function main() {
  console.log("🌱 Seeding RDPR OS — razón social + marcas comerciales…")

  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!user) {
    console.log(`\n⚠ Usuario ${ADMIN_EMAIL} no encontrado. Regístrate y vuelve a ejecutar npm run db:seed`)
    return
  }

  const memberships = await prisma.userCompany.findMany({
    where: { userId: user.id },
    include: { company: true },
    orderBy: { createdAt: "asc" },
  })

  if (memberships.length === 0) {
    console.log("\n⚠ Sin empresas vinculadas. Crea tu empresa desde el registro.")
    return
  }

  const primary =
    memberships.find((m) => m.company.slug === "rdpr-os") ??
    memberships.find((m) => m.company.legalName?.includes("RDPR Digital")) ??
    memberships[0]

  await ensureRdprLegalEntity(primary.companyId)
  const brands = await ensureCompanyBrands(primary.companyId)

  for (const m of memberships) {
    await ensureChartOfAccounts(m.companyId)
  }

  const company = await prisma.company.findUnique({ where: { id: primary.companyId } })
  console.log(`  ✓ Razón social: ${company?.legalName ?? company?.name}`)
  console.log(`  ✓ ${brands.length} marcas comerciales bajo la misma sociedad`)
  if (memberships.length > 1) {
    console.log(`  ℹ ${memberships.length - 1} empresa(s) legacy en el selector — puedes ignorarlas o eliminarlas`)
  }

  console.log(`\n✅ Listo para ${ADMIN_EMAIL}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
