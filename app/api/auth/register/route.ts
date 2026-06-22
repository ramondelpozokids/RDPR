// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma/client"

const registerSchema = z.object({
  name:        z.string().min(1),
  email:       z.string().email(),
  password:    z.string().min(8),
  companyName: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
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

      const company = await tx.company.create({
        data: { name: companyName },
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

    return NextResponse.json({ success: true, userId: result.user.id }, { status: 201 })
  } catch (err) {
    console.error("[register]", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
