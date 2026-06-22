// app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { auth }   from "@/lib/auth/config"

const companySchema = z.object({
  name:       z.string().min(1).optional(),
  legalName:  z.string().min(1).optional(),
  taxId:      z.string().optional(),
  email:      z.string().email().optional().or(z.literal("")),
  phone:      z.string().optional(),
  address:    z.string().optional(),
  city:       z.string().optional(),
  postalCode: z.string().optional(),
  currency:   z.string().optional(),
  taxRate:    z.number().min(0).max(100).optional(),
  taxEntityType: z.enum(["AUTONOMO", "SL", "SA", "OTHER"]).optional(),
  vatFilingPeriod: z.enum(["QUARTERLY", "MONTHLY"]).optional(),
  irpfRegime: z.enum(["DIRECT_ESTIMATION", "OBJECTIVE_MODULES"]).optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // Verificar que el usuario es ADMIN de esta empresa
  const uc = await prisma.userCompany.findFirst({
    where: { userId: session.user.id as string, companyId: params.id, role: "ADMIN" },
  })
  if (!uc) return NextResponse.json({ error: "Sin permisos" }, { status: 403 })

  const body   = await req.json()
  const parsed = companySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const company = await prisma.company.update({
    where: { id: params.id },
    data:  parsed.data,
  })

  return NextResponse.json({ success: true, data: company })
}
