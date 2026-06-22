import Link from "next/link"
import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { formatCurrency } from "@/lib/utils"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Wallet, ArrowRight } from "lucide-react"

export default async function PayrollPage() {
  const companyId = await getActiveCompanyId()
  if (!companyId) return <p className="text-sm text-muted-foreground">No autorizado</p>

  const [employeeCount, activeEmployees, latestRun, runsCount] = await Promise.all([
    prisma.employee.count({ where: { companyId } }),
    prisma.employee.count({ where: { companyId, active: true } }),
    prisma.payrollRun.findFirst({
      where: { companyId },
      orderBy: { period: "desc" },
      include: { lines: true },
    }),
    prisma.payrollRun.count({ where: { companyId } }),
  ])

  const latestTotal = latestRun?.lines.reduce((s, l) => s + l.net, 0) ?? 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>RDPR Payroll</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Plantilla, nóminas y recibos (MVP)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/payroll/employees">Plantilla</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/payroll/runs">Nóminas</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Empleados activos" value={String(activeEmployees)} icon={Users} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <MetricCard label="Total plantilla" value={String(employeeCount)} icon={Users} iconColor="text-sky-600" iconBg="bg-sky-50" />
        <MetricCard label="Nóminas generadas" value={String(runsCount)} icon={FileText} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <MetricCard
          label={latestRun ? `Última (${latestRun.period})` : "Última nómina"}
          value={latestRun ? formatCurrency(latestTotal) : "—"}
          icon={Wallet}
          iconColor="text-primary"
          iconBg="bg-accent"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/payroll/employees" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold group-hover:text-brand-600 transition-colors">Plantilla</h3>
              <p className="text-sm text-muted-foreground mt-1">Altas, contratos y salarios base</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground" />
          </div>
        </Link>
        <Link href="/dashboard/payroll/runs" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold group-hover:text-brand-600 transition-colors">Nóminas</h3>
              <p className="text-sm text-muted-foreground mt-1">Generar periodo, editar líneas y PDF</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground" />
          </div>
        </Link>
      </div>
    </div>
  )
}
