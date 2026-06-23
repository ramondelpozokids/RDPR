// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma/client"
import { slugify } from "@/lib/utils"
import {
  isPublicRegistrationEnabled,
  registrationClosedMessage,
} from "@/lib/auth/registration"

const registerSchema = z.object({
  name:        z.string().min(1),
  email:       z.string().email(),
  password:    z.string().min(8),
  companyName: z.string().min(1),
  inviteToken: z.string().optional(),
})

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Base de datos no configurada (DATABASE_URL)" },
      { status: 503 }
    )
  }

  try {
    const body   = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const inviteHeader = req.headers.get("x-registration-invite")
    if (!isPublicRegistrationEnabled(parsed.data.inviteToken ?? inviteHeader)) {
      return NextResponse.json({ error: registrationClosedMessage() }, { status: 403 })
    }

    const { name, email, password, companyName } = parsed.data

    // Comprobar si el email ya existe
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Crear usuario y empresa en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash },
      })

      const baseSlug = slugify(companyName) || "empresa"
      const unique   = `${baseSlug}-${Date.now().toString(36).slice(-4)}`

      const organization = await tx.organization.create({
        data: {
          name: companyName,
          slug: `org-${unique}`,
          type: "CLIENT",
        },
      })

      const company = await tx.company.create({
        data: {
          name:           companyName,
          legalName:      companyName,
          slug:           unique,
          organizationId: organization.id,
          brandColor:     "#6570f3",
          taxEntityType:  "SL",
          vatFilingPeriod: "QUARTERLY",
        },
      })

      await tx.userCompany.create({
        data: { userId: user.id, companyId: company.id, role: "ADMIN" },
      })

      await tx.activityLog.create({
        data: {
          companyId: company.id,
          userId:    user.id,
          action:    "COMPANY_CREATED",
          entity:    "Company",
          entityId:  company.id,
        },
      })

      return { user, company }
    })

    const { ensureCompanyBrands, ensureRdprLegalEntity } = await import("@/lib/brands/ensure")
    await ensureRdprLegalEntity(result.company.id)
    await ensureCompanyBrands(result.company.id)

    return NextResponse.json({ success: true, userId: result.user.id }, { status: 201 })
  } catch (err) {
    console.error("[register]", err)

    if (err instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "No se puede conectar con la base de datos. Revisa DATABASE_URL en Vercel." },
        { status: 503 }
      )
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      return NextResponse.json(
        { error: "Las tablas no existen. Ejecuta npm run db:push contra Supabase." },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
