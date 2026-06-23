import { prisma } from "@/lib/prisma/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { syncOverdueInvoices } from "@/lib/invoices/sync-overdue"
import { getCashflowForecast, getAccountingInsights } from "@/lib/accounting/insights"
import { getAccountLedger } from "@/lib/accounting/ledger"

export type IntelligenceQueryId =
  | "billed_month"
  | "paid_month"
  | "pending_invoices"
  | "overdue_invoices"
  | "active_projects"
  | "customers_summary"
  | "vat_quarter"
  | "top_customers"
  | "expenses_month"
  | "cashflow_forecast"
  | "accounting_alerts"
  | "ledger_balance"
  | "payroll_cost_month"
  | "payroll_employees"
  | "pending_crm_tasks"
  | "ocr_review_queue"
  | "signatures_pending"
  | "onboarding_incomplete"

export type IntelligenceLink = { href: string; label: string }
export type IntelligenceHighlight = { label: string; value: string }

export type IntelligenceResult = {
  queryId: IntelligenceQueryId
  question: string
  answer: string
  highlights?: IntelligenceHighlight[]
  links?: IntelligenceLink[]
}

export const PREDEFINED_QUERIES: Array<{
  id: IntelligenceQueryId
  label: string
  category: "finanzas" | "crm" | "proyectos" | "laboral"
}> = [
  { id: "billed_month", label: "¿Cuánto he facturado este mes?", category: "finanzas" },
  { id: "paid_month", label: "¿Cuánto he cobrado este mes?", category: "finanzas" },
  { id: "vat_quarter", label: "¿Cuánto IVA estimo este trimestre?", category: "finanzas" },
  { id: "pending_invoices", label: "¿Qué facturas están pendientes?", category: "finanzas" },
  { id: "overdue_invoices", label: "¿Qué facturas están vencidas?", category: "finanzas" },
  { id: "top_customers", label: "¿Qué clientes generan más ingresos?", category: "crm" },
  { id: "customers_summary", label: "¿Cuántos clientes tengo?", category: "crm" },
  { id: "active_projects", label: "¿Cuántos proyectos activos hay?", category: "proyectos" },
  { id: "expenses_month", label: "¿Cuánto he gastado este mes?", category: "finanzas" },
  { id: "cashflow_forecast", label: "¿Cómo está mi tesorería proyectada?", category: "finanzas" },
  { id: "accounting_alerts", label: "¿Hay alertas contables?", category: "finanzas" },
  { id: "ledger_balance", label: "¿Cuál es el saldo de clientes (430)?", category: "finanzas" },
  { id: "payroll_cost_month", label: "¿Cuál es el coste de nómina este mes?", category: "laboral" },
  { id: "payroll_employees", label: "¿Cuántos empleados tengo en plantilla?", category: "laboral" },
  { id: "pending_crm_tasks", label: "¿Qué tareas de clientes están pendientes?", category: "crm" },
  { id: "ocr_review_queue", label: "¿Hay facturas pendientes de revisión OCR?", category: "finanzas" },
  { id: "signatures_pending", label: "¿Hay firmas pendientes de clientes?", category: "crm" },
  { id: "onboarding_incomplete", label: "¿Qué clientes no han completado el onboarding?", category: "crm" },
]

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function quarterStart(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3) * 3
  return new Date(d.getFullYear(), q, 1)
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "sin cambio"
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return "sin cambio"
  return pct > 0 ? `+${pct}%` : `${pct}%`
}

/** Intenta emparejar texto libre con una consulta predefinida (v0). */
export function matchQueryFromText(text: string): IntelligenceQueryId | null {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  if ((t.includes("factur") || t.includes("emit")) && t.includes("mes")) return "billed_month"
  if ((t.includes("cobr") || t.includes("pagad")) && t.includes("mes")) return "paid_month"
  if (t.includes("iva") && (t.includes("trimestre") || t.includes("trim"))) return "vat_quarter"
  if (t.includes("vencid") || t.includes("atrasad")) return "overdue_invoices"
  if (t.includes("pendient") && (t.includes("factur") || t.includes("cobr"))) return "pending_invoices"
  if (t.includes("cliente") && (t.includes("ingreso") || t.includes("factur") || t.includes("top"))) return "top_customers"
  if (t.includes("cliente") && (t.includes("cuant") || t.includes("numero") || t.includes("tengo"))) return "customers_summary"
  if (t.includes("proyecto") && (t.includes("activ") || t.includes("curso"))) return "active_projects"
  if ((t.includes("gast") || t.includes("compr")) && t.includes("mes")) return "expenses_month"
  if (t.includes("tesorer") || t.includes("caja") || t.includes("flujo")) return "cashflow_forecast"
  if (t.includes("alert") || t.includes("anomal") || t.includes("concili")) return "accounting_alerts"
  if (t.includes("430") || (t.includes("cliente") && t.includes("saldo"))) return "ledger_balance"
  if ((t.includes("nomina") || t.includes("sueldo") || t.includes("salario")) && t.includes("mes")) return "payroll_cost_month"
  if (t.includes("empleado") || t.includes("plantilla") || t.includes("trabajador")) return "payroll_employees"
  if (t.includes("tarea") && t.includes("pendient")) return "pending_crm_tasks"
  if (t.includes("ocr") || (t.includes("factura") && t.includes("revis"))) return "ocr_review_queue"
  if (t.includes("firma") && t.includes("pendient")) return "signatures_pending"
  if (t.includes("onboarding") || (t.includes("alta") && t.includes("cliente"))) return "onboarding_incomplete"

  return null
}

export async function executeIntelligenceQuery(
  queryId: IntelligenceQueryId,
  companyId: string
): Promise<IntelligenceResult> {
  await syncOverdueInvoices(companyId)

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  })
  const companyName = company?.name ?? "tu empresa"

  const meta = PREDEFINED_QUERIES.find((q) => q.id === queryId)!
  const now = new Date()
  const thisMonth = monthStart(now)
  const lastMonth = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const lastMonthEnd = new Date(thisMonth.getTime() - 1)
  const qStart = quarterStart(now)

  switch (queryId) {
    case "billed_month": {
      const [thisAgg, lastAgg] = await Promise.all([
        prisma.invoice.aggregate({
          where: { companyId, issueDate: { gte: thisMonth } },
          _sum: { total: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: { companyId, issueDate: { gte: lastMonth, lte: lastMonthEnd } },
          _sum: { total: true },
        }),
      ])
      const total = thisAgg._sum.total ?? 0
      const last = lastAgg._sum.total ?? 0
      return {
        queryId,
        question: meta.label,
        answer: `En **${companyName}** has emitido **${formatCurrency(total)}** este mes (${thisAgg._count} factura(s)). Comparado con el mes anterior: ${pctChange(total, last)}.`,
        highlights: [
          { label: "Facturado", value: formatCurrency(total) },
          { label: "Facturas", value: String(thisAgg._count) },
          { label: "vs mes anterior", value: pctChange(total, last) },
        ],
        links: [{ href: "/dashboard/finance/invoicing", label: "Ver facturación" }],
      }
    }

    case "paid_month": {
      const [thisAgg, lastAgg] = await Promise.all([
        prisma.invoice.aggregate({
          where: { companyId, status: "PAID", paidAt: { gte: thisMonth } },
          _sum: { total: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: { companyId, status: "PAID", paidAt: { gte: lastMonth, lte: lastMonthEnd } },
          _sum: { total: true },
        }),
      ])
      const total = thisAgg._sum.total ?? 0
      const last = lastAgg._sum.total ?? 0
      return {
        queryId,
        question: meta.label,
        answer: `Has cobrado **${formatCurrency(total)}** este mes en ${companyName} (${thisAgg._count} factura(s) pagadas). Variación vs mes anterior: ${pctChange(total, last)}.`,
        highlights: [
          { label: "Cobrado", value: formatCurrency(total) },
          { label: "Pagadas", value: String(thisAgg._count) },
          { label: "vs mes anterior", value: pctChange(total, last) },
        ],
        links: [{ href: "/dashboard/finance/invoicing", label: "Ver facturas" }],
      }
    }

    case "vat_quarter": {
      const agg = await prisma.invoice.aggregate({
        where: { companyId, issueDate: { gte: qStart } },
        _sum: { taxAmount: true, total: true },
        _count: true,
      })
      const tax = agg._sum.taxAmount ?? 0
      const billed = agg._sum.total ?? 0
      return {
        queryId,
        question: meta.label,
        answer: `El IVA estimado de facturas emitidas este trimestre en **${companyName}** es **${formatCurrency(tax)}**, sobre ${formatCurrency(billed)} facturados (${agg._count} factura(s)). Esto es orientativo según tus facturas emitidas.`,
        highlights: [
          { label: "IVA estimado", value: formatCurrency(tax) },
          { label: "Base facturada", value: formatCurrency(billed) },
        ],
        links: [{ href: "/dashboard/finance/invoicing", label: "Ver facturas" }],
      }
    }

    case "pending_invoices": {
      const rows = await prisma.invoice.findMany({
        where: { companyId, status: "PENDING" },
        include: { customer: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
        take: 8,
      })
      const total = rows.reduce((s, i) => s + i.total, 0)
      if (rows.length === 0) {
        return {
          queryId,
          question: meta.label,
          answer: `No tienes facturas pendientes de cobro en **${companyName}**. ¡Buen trabajo!`,
          links: [{ href: "/dashboard/finance/invoicing", label: "Ver facturación" }],
        }
      }
      const list = rows
        .map(
          (i) =>
            `• **${i.number}** — ${i.customer.name}: ${formatCurrency(i.total)}${i.dueDate ? ` (vence ${formatDate(i.dueDate)})` : ""}`
        )
        .join("\n")
      return {
        queryId,
        question: meta.label,
        answer: `Tienes **${rows.length}** factura(s) pendientes por **${formatCurrency(total)}**:\n\n${list}`,
        highlights: [
          { label: "Pendiente", value: formatCurrency(total) },
          { label: "Facturas", value: String(rows.length) },
        ],
        links: [{ href: "/dashboard/finance/invoicing", label: "Gestionar cobros" }],
      }
    }

    case "overdue_invoices": {
      const rows = await prisma.invoice.findMany({
        where: { companyId, status: "OVERDUE" },
        include: { customer: { select: { name: true, email: true } } },
        orderBy: { dueDate: "asc" },
        take: 8,
      })
      const total = rows.reduce((s, i) => s + i.total, 0)
      if (rows.length === 0) {
        return {
          queryId,
          question: meta.label,
          answer: `No hay facturas vencidas en **${companyName}**.`,
          links: [{ href: "/dashboard/finance/invoicing", label: "Ver facturación" }],
        }
      }
      const list = rows
        .map(
          (i) =>
            `• **${i.number}** — ${i.customer.name}: ${formatCurrency(i.total)}${i.dueDate ? ` (venció ${formatDate(i.dueDate)})` : ""}`
        )
        .join("\n")
      return {
        queryId,
        question: meta.label,
        answer: `⚠️ Tienes **${rows.length}** factura(s) vencida(s) por **${formatCurrency(total)}**:\n\n${list}\n\nPuedes enviar un recordatorio desde la página de facturación.`,
        highlights: [
          { label: "Vencido", value: formatCurrency(total) },
          { label: "Facturas", value: String(rows.length) },
        ],
        links: [{ href: "/dashboard/finance/invoicing", label: "Enviar recordatorios" }],
      }
    }

    case "customers_summary": {
      const [total, byStage] = await Promise.all([
        prisma.customer.count({ where: { companyId } }),
        prisma.customer.groupBy({
          by: ["pipelineStage"],
          where: { companyId },
          _count: true,
        }),
      ])
      const won = byStage.find((s) => s.pipelineStage === "CLIENT_WON")?._count ?? 0
      const inPipeline = byStage
        .filter((s) => s.pipelineStage !== "CLIENT_LOST")
        .reduce((s, x) => s + x._count, 0)
      return {
        queryId,
        question: meta.label,
        answer: `**${companyName}** tiene **${total}** contacto(s) en el CRM. ${won} cliente(s) ganado(s) y ${inPipeline} en pipeline activo.`,
        highlights: [
          { label: "Total contactos", value: String(total) },
          { label: "Clientes ganados", value: String(won) },
        ],
        links: [{ href: "/dashboard/crm", label: "Abrir CRM" }],
      }
    }

    case "top_customers": {
      const rows = await prisma.invoice.groupBy({
        by: ["customerId"],
        where: { companyId, status: { in: ["PAID", "PENDING", "OVERDUE"] } },
        _sum: { total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      })
      if (rows.length === 0) {
        return {
          queryId,
          question: meta.label,
          answer: `Aún no hay datos de facturación por cliente en **${companyName}**.`,
          links: [{ href: "/dashboard/crm/new", label: "Añadir cliente" }],
        }
      }
      const customers = await prisma.customer.findMany({
        where: { id: { in: rows.map((r) => r.customerId) } },
        select: { id: true, name: true },
      })
      const nameMap = Object.fromEntries(customers.map((c) => [c.id, c.name]))
      const list = rows
        .map((r, i) => {
          const name = nameMap[r.customerId] ?? "Cliente"
          return `${i + 1}. **${name}** — ${formatCurrency(r._sum.total ?? 0)}`
        })
        .join("\n")
      return {
        queryId,
        question: meta.label,
        answer: `Top clientes por facturación en **${companyName}**:\n\n${list}`,
        links: [{ href: "/dashboard/crm", label: "Ver CRM" }],
      }
    }

    case "active_projects": {
      const [active, overdue, recent] = await Promise.all([
        prisma.project.count({ where: { companyId, status: "IN_PROGRESS" } }),
        prisma.project.count({
          where: { companyId, status: "IN_PROGRESS", endDate: { lt: now } },
        }),
        prisma.project.findMany({
          where: { companyId, status: "IN_PROGRESS" },
          select: { name: true, endDate: true },
          orderBy: { endDate: "asc" },
          take: 5,
        }),
      ])
      let detail = ""
      if (recent.length > 0) {
        detail =
          "\n\nProyectos en curso:\n" +
          recent
            .map((p) => {
              const due = p.endDate ? formatDate(p.endDate) : "sin fecha fin"
              return `• **${p.name}** (fin: ${due})`
            })
            .join("\n")
      }
      const overdueNote =
        overdue > 0 ? `\n\n⚠️ **${overdue}** proyecto(s) han superado la fecha de fin.` : ""
      return {
        queryId,
        question: meta.label,
        answer: `Hay **${active}** proyecto(s) activo(s) en **${companyName}**.${overdueNote}${detail}`,
        highlights: [
          { label: "Activos", value: String(active) },
          ...(overdue > 0 ? [{ label: "Fuera de plazo", value: String(overdue) }] : []),
        ],
        links: [{ href: "/dashboard/projects", label: "Ver proyectos" }],
      }
    }

    case "expenses_month": {
      const thisMonth = monthStart(now)
      const rows = await prisma.expense.findMany({
        where: { companyId, issueDate: { gte: thisMonth }, status: { not: "CANCELLED" } },
      })
      const subtotal = rows.reduce((s, e) => s + e.subtotal, 0)
      const iva = rows.reduce((s, e) => s + e.taxAmount, 0)
      return {
        queryId,
        question: meta.label,
        answer: `En **${companyName}** has registrado **${formatCurrency(subtotal)}** en gastos (base) este mes (${rows.length} registro(s)). IVA soportado: **${formatCurrency(iva)}**.`,
        highlights: [
          { label: "Gastos (base)", value: formatCurrency(subtotal) },
          { label: "IVA soportado", value: formatCurrency(iva) },
          { label: "Registros", value: String(rows.length) },
        ],
        links: [{ href: "/dashboard/finance/expenses", label: "Ver gastos" }],
      }
    }

    case "cashflow_forecast": {
      const cf = await getCashflowForecast(companyId)
      const tone =
        cf.projectedBalance < 0
          ? "⚠️ La proyección es **negativa** — revisa cobros y pagos pendientes."
          : "La tesorería proyectada es **positiva**."
      return {
        queryId,
        question: meta.label,
        answer: `**${companyName}** — Saldo banco importado: **${formatCurrency(cf.bankBalance)}**. Por cobrar: **${formatCurrency(cf.pendingIn)}** · Por pagar: **${formatCurrency(cf.pendingOut)}**. Proyección: **${formatCurrency(cf.projectedBalance)}**. ${tone}`,
        highlights: [
          { label: "Saldo banco", value: formatCurrency(cf.bankBalance) },
          { label: "Por cobrar", value: formatCurrency(cf.pendingIn) },
          { label: "Proyección", value: formatCurrency(cf.projectedBalance) },
        ],
        links: [
          { href: "/dashboard/finance", label: "Ver finanzas" },
          { href: "/dashboard/finance/banking", label: "Importar banco" },
        ],
      }
    }

    case "accounting_alerts": {
      const alerts = await getAccountingInsights(companyId)
      const critical = alerts.filter((a) => a.type === "danger" || a.type === "warning")
      const list = alerts
        .slice(0, 5)
        .map((a) => `• **${a.title}** — ${a.description}`)
        .join("\n")
      return {
        queryId,
        question: meta.label,
        answer:
          critical.length > 0
            ? `Hay **${critical.length}** alerta(s) que requieren atención en **${companyName}**:\n\n${list}`
            : `Sin alertas críticas en **${companyName}**:\n\n${list}`,
        highlights: [
          { label: "Alertas totales", value: String(alerts.length) },
          { label: "Críticas", value: String(critical.length) },
        ],
        links: [{ href: "/dashboard/finance", label: "Ver finanzas" }],
      }
    }

    case "ledger_balance": {
      const ledger = await getAccountLedger(companyId, "430")
      if (!ledger || ledger.movements.length === 0) {
        return {
          queryId,
          question: meta.label,
          answer: `La cuenta **430 Clientes** en **${companyName}** no tiene movimientos todavía.`,
          links: [{ href: "/dashboard/finance/invoicing", label: "Emitir factura" }],
        }
      }
      return {
        queryId,
        question: meta.label,
        answer: `Saldo de **430 Clientes** en **${companyName}**: **${formatCurrency(ledger.closingBalance)}** (${ledger.movements.length} movimiento(s)).`,
        highlights: [
          { label: "Saldo 430", value: formatCurrency(ledger.closingBalance) },
          { label: "Movimientos", value: String(ledger.movements.length) },
        ],
        links: [{ href: "/dashboard/finance/ledger/430", label: "Ver libro mayor 430" }],
      }
    }

    case "payroll_cost_month": {
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      const run = await prisma.payrollRun.findUnique({
        where: { companyId_period: { companyId, period } },
        include: { lines: true },
      })
      if (!run || run.lines.length === 0) {
        return {
          queryId,
          question: meta.label,
          answer: `No hay nómina generada para **${period}** en **${companyName}**. Crea una desde Payroll.`,
          links: [{ href: "/dashboard/payroll/runs", label: "Generar nómina" }],
        }
      }
      const gross = run.lines.reduce((s, l) => s + l.gross, 0)
      const net = run.lines.reduce((s, l) => s + l.net, 0)
      return {
        queryId,
        question: meta.label,
        answer: `Coste de nómina **${period}** en **${companyName}**: **${formatCurrency(gross)}** bruto · **${formatCurrency(net)}** neto (${run.lines.length} empleado(s)).`,
        highlights: [
          { label: "Bruto", value: formatCurrency(gross) },
          { label: "Neto", value: formatCurrency(net) },
          { label: "Empleados", value: String(run.lines.length) },
        ],
        links: [{ href: "/dashboard/payroll/runs", label: "Ver nóminas" }],
      }
    }

    case "payroll_employees": {
      const [active, total] = await Promise.all([
        prisma.employee.count({ where: { companyId, active: true } }),
        prisma.employee.count({ where: { companyId } }),
      ])
      return {
        queryId,
        question: meta.label,
        answer: `**${companyName}** tiene **${active}** empleado(s) activo(s) de **${total}** registrados en plantilla.`,
        highlights: [
          { label: "Activos", value: String(active) },
          { label: "Total", value: String(total) },
        ],
        links: [{ href: "/dashboard/payroll/employees", label: "Ver plantilla" }],
      }
    }

    case "pending_crm_tasks": {
      const tasks = await prisma.customerTask.findMany({
        where: { companyId, status: { not: "DONE" } },
        include: { customer: { select: { name: true, id: true } } },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        take: 8,
      })
      if (tasks.length === 0) {
        return {
          queryId,
          question: meta.label,
          answer: "No hay tareas de clientes pendientes. ¡Todo al día!",
          links: [{ href: "/dashboard/crm", label: "Ver CRM" }],
        }
      }
      const list = tasks.map((t) => `• **${t.customer.name}**: ${t.title}`).join("\n")
      return {
        queryId,
        question: meta.label,
        answer: `Hay **${tasks.length}** tarea(s) pendiente(s) en expedientes de clientes:\n\n${list}`,
        highlights: [{ label: "Pendientes", value: String(tasks.length) }],
        links: [{ href: "/dashboard/crm", label: "Centro CRM" }],
      }
    }

    case "ocr_review_queue": {
      const count = await prisma.expenseDraft.count({
        where: { companyId, status: "PENDING_REVIEW" },
      })
      return {
        queryId,
        question: meta.label,
        answer:
          count === 0
            ? "No hay borradores de gastos pendientes de revisión OCR."
            : `Hay **${count}** factura(s) detectadas por IA pendientes de tu aprobación en la bandeja de revisión.`,
        highlights: [{ label: "Por revisar", value: String(count) }],
        links: [{ href: "/dashboard/documents/review", label: "Bandeja revisión IA" }],
      }
    }

    case "signatures_pending": {
      const count = await prisma.signatureRequest.count({
        where: { companyId, status: "PENDING" },
      })
      return {
        queryId,
        question: meta.label,
        answer:
          count === 0
            ? "No hay solicitudes de firma pendientes."
            : `Hay **${count}** solicitud(es) de firma esperando respuesta de clientes.`,
        highlights: [{ label: "Firmas pendientes", value: String(count) }],
        links: [{ href: "/dashboard/signatures", label: "Ver firmas" }],
      }
    }

    case "onboarding_incomplete": {
      const profiles = await prisma.customerProfile.findMany({
        where: { onboardingStatus: { not: "COMPLETE" }, customer: { companyId, pipelineStage: "CLIENT_WON" } },
        include: { customer: { select: { name: true, id: true } } },
        take: 10,
      })
      if (profiles.length === 0) {
        return {
          queryId,
          question: meta.label,
          answer: "Todos los clientes activos han completado el onboarding.",
          links: [{ href: "/dashboard/crm", label: "Ver CRM" }],
        }
      }
      const list = profiles.map((p) => `• **${p.customer.name}** (${p.onboardingStatus})`).join("\n")
      return {
        queryId,
        question: meta.label,
        answer: `**${profiles.length}** cliente(s) con onboarding incompleto:\n\n${list}`,
        highlights: [{ label: "Incompletos", value: String(profiles.length) }],
        links: [{ href: "/dashboard", label: "Centro de mando" }],
      }
    }

    default:
      return {
        queryId,
        question: meta.label,
        answer: "Consulta no disponible.",
      }
  }
}

export async function askIntelligence(
  companyId: string,
  input: { queryId?: IntelligenceQueryId; message?: string }
): Promise<IntelligenceResult | { error: string }> {
  let queryId = input.queryId

  if (!queryId && input.message?.trim()) {
    queryId = matchQueryFromText(input.message.trim()) ?? undefined
  }

  if (!queryId) {
    return {
      error:
        "No reconozco esa pregunta todavía. Prueba una de las sugeridas — en v0 RDPR Intelligence responde con consultas predefinidas sobre tus datos reales.",
    }
  }

  return executeIntelligenceQuery(queryId, companyId)
}
