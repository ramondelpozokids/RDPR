// app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt  from "bcryptjs"
import { z }   from "zod"
import { prisma } from "@/lib/prisma/client"
import { auth }   from "@/lib/auth/config"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id as string } })
  if (!user?.passwordHash) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } })

  return NextResponse.json({ success: true })
}
