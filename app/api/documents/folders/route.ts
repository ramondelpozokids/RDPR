import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const customerId = new URL(req.url).searchParams.get("customerId")

  const folders = await prisma.documentFolder.findMany({
    where: {
      companyId,
      ...(customerId ? { customerId } : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { documents: true } } },
  })

  return NextResponse.json({ success: true, data: folders })
}

export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const name = String(body.name ?? "").trim()
  const customerId = body.customerId ? String(body.customerId) : null
  const parentId = body.parentId ? String(body.parentId) : null

  if (!name) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })
  }

  if (customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
    })
    if (!customer) {
      return NextResponse.json({ error: "Cliente no válido" }, { status: 400 })
    }
  }

  const folder = await prisma.documentFolder.create({
    data: { companyId, name, customerId, parentId },
  })

  return NextResponse.json({ success: true, data: folder }, { status: 201 })
}
