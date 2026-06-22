import { getActiveCompanyId } from "@/lib/company/context"
import { prisma } from "@/lib/prisma/client"
import { backfillAllJournalEntries } from "@/lib/accounting/journal"
import { FinanceNav } from "@/components/finance/FinanceNav"
import { ExpenseActions } from "@/components/finance/ExpenseActions"
import { MetricCard } from "@/components/ui/metric-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/accounting/pgc-accounts"
import { Plus, Receipt, Clock } from "lucide-react"
import Link from "next/link"

const STATUS_BADGE: Record<string, "warning" | "success" | "muted"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELLED: "muted",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  CANCELLED: "Anulado",
}

export default async function ExpensesPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-muted-foreground text-sm">No autorizado</p>

  await backfillAllJournalEntries(companyId)

  const expenses = await prisma.expense.findMany({
    where: { companyId, status: { not: "CANCELLED" } },
    orderBy: { issueDate: "desc" },
  })

  const totalMonth = expenses
    .filter((e) => {
      const d = new Date()
      return e.issueDate.getMonth() === d.getMonth() && e.issueDate.getFullYear() === d.getFullYear()
    })
    .reduce((s, e) => s + e.subtotal, 0)

  const ivaSoportado = expenses.reduce((s, e) => s + e.taxAmount, 0)
  const pending = expenses.filter((e) => e.status === "PENDING").reduce((s, e) => s + e.total, 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Gastos y compras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{expenses.length} gasto(s) registrado(s)</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/finance/expenses/new">
            <Plus size={15} />
            Nuevo gasto
          </Link>
        </Button>
      </div>

      <FinanceNav />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Gastos del mes (base)" value={formatCurrency(totalMonth)} icon={Receipt} iconColor="text-red-600" iconBg="bg-red-50" />
        <MetricCard label="IVA soportado total" value={formatCurrency(ivaSoportado)} icon={Receipt} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <MetricCard label="Pendiente de pago" value={formatCurrency(pending)} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      {expenses.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-4">Registra tu primer gasto para activar el IVA soportado en el modelo 303.</p>
          <Button asChild>
            <Link href="/dashboard/finance/expenses/new">
              <Plus size={14} /> Registrar gasto
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Descripción</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Proveedor</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden md:table-cell">Categoría</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-right px-5 py-3 text-muted-foreground font-medium">Total</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Estado</th>
                <th className="text-left px-5 py-3 text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{exp.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Base {formatCurrency(exp.subtotal)} + IVA {formatCurrency(exp.taxAmount)}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{exp.vendor ?? "—"}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <Badge variant="muted">{EXPENSE_CATEGORY_LABELS[exp.category]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(exp.issueDate)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatCurrency(exp.total)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_BADGE[exp.status]}>{STATUS_LABELS[exp.status]}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <ExpenseActions expenseId={exp.id} status={exp.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Asiento automático: Debe cuenta de gasto (600/626/629) + 472 IVA soportado · Haber 400 Proveedores o 572 Banco.
      </p>
    </div>
  )
}
