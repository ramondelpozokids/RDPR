// app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z }      from "zod"
import { prisma } from "@/lib/prisma/client"
import { requireCompanyId } from "@/lib/company/context"

const customerSchema = z.object({
  name:          z.string().min(1),
  email:         z.string().email().optional().or(z.literal("")),
  phone:         z.string().optional(),
  address:       z.string().optional(),
  city:          z.string().optional(),
  taxId:         z.string().optional(),
  notes:         z.string().optional(),
  pipelineStage: z.enum(["NEW_CONTACT","QUOTE_SENT","CLIENT_WON","CLIENT_LOST"]).optional(),
})

// GET /api/customers
export async function GET(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("q") ?? ""

  const customers = await prisma.customer.findMany({
    where: {
      companyId,
      ...(search && {
        OR: [
          { name:  { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ success: true, data: customers })
}

// POST /api/customers
export async function POST(req: NextRequest) {
  const companyId = await requireCompanyId()
  if (!companyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body   = await req.json()
  const parsed = customerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const customer = await prisma.customer.create({
    data: { companyId, ...parsed.data },
  })

  return NextResponse.json({ success: true, data: customer }, { status: 201 })
}
