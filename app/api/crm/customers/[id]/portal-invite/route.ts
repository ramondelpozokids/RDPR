import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"
import bcrypt from "bcryptjs"
import crypto from "crypto"

type Params = { params: { id: string } }

/** Crea o vincula usuario CLIENT y acceso al portal del expediente CRM. */
export async function POST(_req: Request, { params }: Params) {
  const companyId = await requireCompanyId()
  if (!companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, companyId },
  })
  if (!customer) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
  }
  if (!customer.email?.trim()) {
    return NextResponse.json(
      { error: "El cliente debe tener email para invitar al portal" },
      { status: 400 }
    )
  }

  const email = customer.email.trim().toLowerCase()

  let user = await prisma.user.findUnique({ where: { email } })
  let temporaryPassword: string | undefined

  if (!user) {
    temporaryPassword = crypto.randomBytes(4).toString("hex") + "A1!"
    user = await prisma.user.create({
      data: {
        email,
        name: customer.name,
        passwordHash: await bcrypt.hash(temporaryPassword, 12),
      },
    })
  }

  const existingMembership = await prisma.userCompany.findFirst({
    where: { userId: user.id },
  })
  if (existingMembership) {
    return NextResponse.json(
      { error: "Este email ya pertenece a un usuario interno. Use otro email de contacto." },
      { status: 409 }
    )
  }

  await prisma.clientPortalAccess.upsert({
    where: { userId_customerId: { userId: user.id, customerId: customer.id } },
    create: { userId: user.id, companyId, customerId: customer.id },
    update: {},
  })

  const existingFolder = await prisma.documentFolder.findFirst({
    where: { companyId, customerId: customer.id, name: "Expediente" },
  })
  if (!existingFolder) {
    await prisma.documentFolder.create({
      data: { companyId, customerId: customer.id, name: "Expediente" },
    })
  }

  return NextResponse.json({
    success: true,
    email,
    temporaryPassword,
    message: temporaryPassword
      ? "Usuario creado. Comparta la contraseña temporal con el cliente."
      : "Acceso al portal activado para usuario existente.",
  })
}

export async function GET(_req: Request, { params }: Params) {
  const companyId = await requireCompanyId()
  if (!companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const access = await prisma.clientPortalAccess.findFirst({
    where: { customerId: params.id, companyId },
    include: { user: { select: { email: true, name: true, createdAt: true } } },
  })

  return NextResponse.json({ success: true, access })
}
