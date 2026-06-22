import { getActiveCompanyId } from "@/lib/company/context"
import { prisma } from "@/lib/prisma/client"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { ReconciliationList } from "@/components/finance/ReconciliationList"
import { Card } from "@/components/ui/card"
import { MetricCard } from "@/components/ui/metric-card"
import { Link2, CheckCircle, Ban } from "lucide-react"

export default async function ReconciliationPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  const [unmatched, matched, ignored, transactions] = await Promise.all([
    prisma.bankTransaction.count({ where: { companyId, status: "UNMATCHED" } }),
    prisma.bankTransaction.count({ where: { companyId, status: "MATCHED" } }),
    prisma.bankTransaction.count({ where: { companyId, status: "IGNORED" } }),
    prisma.bankTransaction.findMany({
      where: { companyId, status: "UNMATCHED" },
      include: { bankAccount: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
  ])

  const serialized = transactions.map((t) => ({
    ...t,
    date: t.date.toISOString(),
  }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Conciliación bancaria</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Empareja movimientos con facturas (entradas) o gastos (salidas)
          </p>
        </div>
      </div>

      <FinanceNav />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Pendientes" value={String(unmatched)} icon={Link2} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <MetricCard label="Conciliados" value={String(matched)} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <MetricCard label="Ignorados" value={String(ignored)} icon={Ban} iconColor="text-muted-foreground" iconBg="bg-muted" />
      </div>

      <Card className="p-5">
        <ReconciliationList transactions={serialized} />
      </Card>

      <p className="text-xs text-muted-foreground mt-4">
        Al conciliar una entrada con factura pendiente, se marca como cobrada y se genera el asiento Debe 572 · Haber 430.
        Al conciliar una salida con gasto pendiente, se marca como pagado (Debe 400 · Haber 572).
      </p>
    </div>
  )
}
