import { prisma } from "@/lib/prisma/client"
import { slugify } from "@/lib/utils"

/** Crea o recupera la gestoría (Firm) asociada a una Company. */
export async function ensureFirmForCompany(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, slug: true, firmId: true, billingPlan: true, billingStatus: true },
  })
  if (!company) return null
  if (company.firmId) {
    return prisma.firm.findUnique({ where: { id: company.firmId } })
  }

  const baseSlug = company.slug ?? slugify(company.name) ?? "gestoria"
  const slug = `${baseSlug}-${company.id.slice(-6)}`

  const firm = await prisma.firm.create({
    data: {
      name: company.name,
      slug,
      billingPlan: company.billingPlan ?? "trial",
      billingStatus: company.billingStatus ?? "trialing",
    },
  })

  await prisma.company.update({
    where: { id: companyId },
    data: { firmId: firm.id },
  })

  return firm
}

export async function getFirmForCompany(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { firm: true },
  })
  if (!company) return null
  if (company.firm) return company.firm
  return ensureFirmForCompany(companyId)
}

/** Sincroniza billing Stripe en Firm y Companies del grupo. */
export async function syncFirmBilling(
  firmId: string,
  data: {
    billingPlan?: string
    billingStatus?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
) {
  const patch = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as typeof data
  if (!Object.keys(patch).length) return

  await prisma.firm.update({ where: { id: firmId }, data: patch })
  await prisma.company.updateMany({ where: { firmId }, data: patch })
}
