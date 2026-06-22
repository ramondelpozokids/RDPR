import { PrismaClient } from "@prisma/client"
import { ensureChartOfAccounts } from "../lib/accounting/journal"

const prisma = new PrismaClient()

const ORG_SLUG = "portfolio-ramon"

const COMPANIES = [
  { slug: "portfolio-ramon",   name: "Portfolio Ramón",   brandColor: "#6570f3" },
  { slug: "courtmanager-pro",  name: "CourtManager Pro",  brandColor: "#2563eb" },
  { slug: "creauna",           name: "Creauna",           brandColor: "#059669" },
  { slug: "bookia-publisher",  name: "BOOKIA Publisher",  brandColor: "#7c3aed" },
  { slug: "editorial",         name: "Editorial",         brandColor: "#d97706" },
]

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "info@ramondelpozorott.es"

async function main() {
  console.log("🌱 Seeding Portfolio Ramón…")

  const org = await prisma.organization.upsert({
    where:  { slug: ORG_SLUG },
    update: { name: "Portfolio Ramón", type: "HOLDING" },
    create: { name: "Portfolio Ramón", slug: ORG_SLUG, type: "HOLDING" },
  })

  const companyIds = []

  for (const c of COMPANIES) {
    const company = await prisma.company.upsert({
      where:  { slug: c.slug },
      update: { name: c.name, brandColor: c.brandColor, organizationId: org.id },
      create: {
        name:           c.name,
        slug:           c.slug,
        brandColor:     c.brandColor,
        organizationId: org.id,
      },
    })
    companyIds.push(company.id)
    console.log(`  ✓ ${c.name}`)
  }

  // Vincular empresa existente del usuario (ej. "RDPR") al holding
  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!user) {
    console.log(`\n⚠ Usuario ${ADMIN_EMAIL} no encontrado. Regístrate primero y vuelve a ejecutar npm run db:seed`)
    return
  }

  const orphanCompanies = await prisma.company.findMany({
    where: {
      organizationId: null,
      users: { some: { userId: user.id } },
    },
  })

  for (const oc of orphanCompanies) {
    if (!oc.slug) {
      await prisma.company.update({
        where: { id: oc.id },
        data: {
          organizationId: org.id,
          slug: `legacy-${oc.id.slice(-8)}`,
        },
      })
      if (!companyIds.includes(oc.id)) companyIds.push(oc.id)
      console.log(`  ✓ Empresa existente vinculada: ${oc.name}`)
    }
  }

  for (const companyId of companyIds) {
    await prisma.userCompany.upsert({
      where:  { userId_companyId: { userId: user.id, companyId } },
      update: { role: "ADMIN" },
      create: { userId: user.id, companyId, role: "ADMIN" },
    })
    await ensureChartOfAccounts(companyId)
  }

  console.log(`\n✅ ${companyIds.length} empresas listas para ${ADMIN_EMAIL}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
