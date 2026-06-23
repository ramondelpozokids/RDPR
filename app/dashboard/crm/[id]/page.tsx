import { Suspense } from "react"
import { prisma } from "@/lib/prisma/client"
import { getActiveCompanyId } from "@/lib/company/context"
import { notFound } from "next/navigation"
import { formatDate, formatCurrency, PIPELINE_LABELS, PROJECT_STATUS_LABELS, INVOICE_STATUS_LABELS } from "@/lib/utils"
import Link from "next/link"
import CustomerEditForm from "./CustomerEditForm"
import { ArrowLeft, Mail, Phone, MapPin, FileText, FolderKanban } from "lucide-react"
import { CustomerExpedienteTabs, getActiveCustomerTab } from "@/components/crm/CustomerExpedienteTabs"
import { PortalInvitePanel } from "@/components/crm/PortalInvitePanel"
import { CustomerDocumentsPanel } from "@/components/crm/CustomerDocumentsPanel"
import { CustomerMessagesPanel } from "@/components/crm/CustomerMessagesPanel"
import { CustomerProfilePanel } from "@/components/crm/CustomerProfilePanel"
import { CustomerTasksPanel } from "@/components/crm/CustomerTasksPanel"
import { CustomerIncidentsPanel } from "@/components/crm/CustomerIncidentsPanel"
import { CustomerFiscalPanel } from "@/components/crm/CustomerFiscalPanel"
import { CustomerActivityTimeline } from "@/components/crm/CustomerActivityTimeline"
import { getCustomerActivityTimeline } from "@/lib/crm/activity-log"

const INVOICE_STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-yellow",
  PAID: "badge-green",
  OVERDUE: "badge-red",
  CANCELLED: "badge-gray",
}

const PROJECT_STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-gray",
  IN_PROGRESS: "badge-blue",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
}

type Props = {
  params: { id: string }
  searchParams: { tab?: string }
}

export default async function CustomerDetailPage({ params, searchParams }: Props) {
  const companyId = await getActiveCompanyId()
  if (!companyId) return notFound()

  const tab = getActiveCustomerTab(searchParams.tab ?? null)

  const customer = await prisma.customer.findFirst({
    where: { id: params.id, companyId },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" }, include: { items: true } },
    },
  })
  if (!customer) return notFound()

  const [documents, folders, portalAccess, profile, tasks, incidents, taxFilings, taxDocuments] = await Promise.all([
    prisma.document.findMany({
      where: { companyId, customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: { folder: { select: { name: true } } },
    }),
    prisma.documentFolder.findMany({
      where: { companyId, customerId: customer.id },
      orderBy: { name: "asc" },
      include: { _count: { select: { documents: true } } },
    }),
    prisma.clientPortalAccess.findFirst({
      where: { customerId: customer.id, companyId },
      include: { user: { select: { email: true } } },
    }),
    prisma.customerProfile.findUnique({ where: { customerId: customer.id } }),
    prisma.customerTask.findMany({
      where: { companyId, customerId: customer.id },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
    prisma.customerIncident.findMany({
      where: { companyId, customerId: customer.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aeatTaxFiling.findMany({
      where: { companyId, customerId: customer.id },
      orderBy: { periodYear: "desc" },
      take: 20,
    }),
    prisma.document.findMany({
      where: {
        companyId,
        customerId: customer.id,
        category: { in: ["TAX", "INVOICE", "PAYROLL"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const profileData = profile ?? {
    entityType: "AUTONOMO" as const,
    legalName: null,
    dniNie: null,
    cnae: null,
    fiscalAddress: null,
    fiscalCity: null,
    fiscalPostalCode: null,
    province: null,
    vatFilingPeriod: "QUARTERLY" as const,
    irpfRegime: null,
    socialSecurityNum: null,
    constitutionDate: null,
    onboardingStatus: "PENDING" as const,
    onboardingStep: 0,
    checklist: null,
  }

  const totalFacturado = customer.invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.total, 0)

  const totalPendiente = customer.invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((s, i) => s + i.total, 0)

  const serializedTasks = tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate?.toISOString() ?? null,
  }))

  const serializedIncidents = incidents.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    resolvedAt: i.resolvedAt?.toISOString() ?? null,
  }))

  const serializedProfile = {
    ...profileData,
    constitutionDate: profileData.constitutionDate?.toISOString() ?? null,
    checklist: profileData.checklist as { id: string; label: string; done: boolean }[] | null,
  }

  const serializedDocs = documents.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
  }))

  const activityEvents =
    tab === "actividad"
      ? await getCustomerActivityTimeline(companyId, customer.id)
      : []

  return (
    <div className="max-w-5xl">
      <div className="flex items-start gap-3 mb-4">
        <Link href="/dashboard/crm" className="text-text-muted hover:text-text-primary mt-1 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm shrink-0">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1>{customer.name}</h1>
              {customer.taxId && (
                <p className="text-sm text-text-secondary">NIF/CIF: {customer.taxId}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <CustomerExpedienteTabs customerId={customer.id} />
      </Suspense>

      {tab === "resumen" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contacto</h3>
              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-text-muted shrink-0" />
                  <a href={`mailto:${customer.email}`} className="text-brand-600 hover:underline truncate">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-text-muted shrink-0" />
                  <a href={`tel:${customer.phone}`} className="text-text-primary hover:text-brand-600">
                    {customer.phone}
                  </a>
                </div>
              )}
              {(customer.address || customer.city) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="text-text-muted shrink-0 mt-0.5" />
                  <span className="text-text-secondary">
                    {[customer.address, customer.city].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <div className="pt-1">
                <span
                  className={
                    customer.pipelineStage === "CLIENT_WON"
                      ? "badge-green"
                      : customer.pipelineStage === "CLIENT_LOST"
                        ? "badge-gray"
                        : customer.pipelineStage === "QUOTE_SENT"
                          ? "badge-yellow"
                          : "badge-blue"
                  }
                >
                  {PIPELINE_LABELS[customer.pipelineStage]}
                </span>
              </div>
              {customer.notes && (
                <div className="text-xs text-text-secondary bg-surface-muted rounded-lg p-3 mt-2 leading-relaxed">
                  {customer.notes}
                </div>
              )}
            </div>

            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Resumen</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Cliente desde</span>
                  <span className="font-medium">{formatDate(customer.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Proyectos</span>
                  <span className="font-medium">{customer.projects.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Documentos</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tareas pendientes</span>
                  <span className="font-medium">{tasks.filter((t) => t.status !== "DONE").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Incidencias abiertas</span>
                  <span className="font-medium">{incidents.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Facturado</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(totalFacturado)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Pendiente</span>
                  <span className="font-medium text-amber-600">{formatCurrency(totalPendiente)}</span>
                </div>
              </div>
            </div>

            <CustomerEditForm customer={customer} />
          </div>

          <div className="lg:col-span-2">
            <PortalInvitePanel
              customerId={customer.id}
              customerEmail={customer.email}
              initialAccess={portalAccess}
            />
          </div>
        </div>
      )}

      {tab === "perfil" && (
        <CustomerProfilePanel customerId={customer.id} initialProfile={serializedProfile} />
      )}

      {tab === "fiscal" && (
        <CustomerFiscalPanel
          customerId={customer.id}
          profile={profile ? {
            entityType: profile.entityType,
            vatFilingPeriod: profile.vatFilingPeriod,
            irpfRegime: profile.irpfRegime,
            onboardingStatus: profile.onboardingStatus,
            dniNie: profile.dniNie,
            cnae: profile.cnae,
          } : null}
          taxFilings={taxFilings}
          taxDocuments={taxDocuments}
        />
      )}

      {tab === "tareas" && (
        <CustomerTasksPanel customerId={customer.id} initialTasks={serializedTasks} />
      )}

      {tab === "incidencias" && (
        <CustomerIncidentsPanel customerId={customer.id} initialIncidents={serializedIncidents} />
      )}

      {tab === "proyectos" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2">
              <FolderKanban size={16} className="text-text-muted" />
              Proyectos ({customer.projects.length})
            </h3>
            <Link
              href={`/dashboard/projects/new?customerId=${customer.id}`}
              className="text-xs text-brand-600 hover:underline font-medium"
            >
              + Nuevo proyecto
            </Link>
          </div>
          {customer.projects.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-sm text-text-muted">Sin proyectos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customer.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="card py-3 px-4 flex items-center justify-between hover:shadow-md transition-shadow group"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary group-hover:text-brand-600 transition-colors">
                      {p.name}
                    </p>
                    {p.endDate && (
                      <p className="text-xs text-text-muted mt-0.5">Fin: {formatDate(p.endDate)}</p>
                    )}
                  </div>
                  <span className={PROJECT_STATUS_COLORS[p.status]}>
                    {PROJECT_STATUS_LABELS[p.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "facturas" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2">
              <FileText size={16} className="text-text-muted" />
              Facturas ({customer.invoices.length})
            </h3>
            <Link
              href={`/dashboard/finance/invoicing/new?customerId=${customer.id}`}
              className="text-xs text-brand-600 hover:underline font-medium"
            >
              + Nueva factura
            </Link>
          </div>
          {customer.invoices.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-sm text-text-muted">Sin facturas</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-muted">
                    <th className="text-left px-4 py-2.5 text-text-secondary font-medium text-xs">Número</th>
                    <th className="text-left px-4 py-2.5 text-text-secondary font-medium text-xs">Fecha</th>
                    <th className="text-left px-4 py-2.5 text-text-secondary font-medium text-xs">Total</th>
                    <th className="text-left px-4 py-2.5 text-text-secondary font-medium text-xs">Estado</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {customer.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-muted/50">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{inv.number}</td>
                      <td className="px-4 py-3 text-text-secondary">{formatDate(inv.issueDate)}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(inv.total)}</td>
                      <td className="px-4 py-3">
                        <span className={INVOICE_STATUS_COLORS[inv.status]}>
                          {INVOICE_STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          target="_blank"
                          className="text-xs text-brand-600 hover:underline font-medium"
                        >
                          PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "documentos" && (
        <CustomerDocumentsPanel
          customerId={customer.id}
          initialDocuments={serializedDocs}
          initialFolders={folders}
        />
      )}

      {tab === "mensajes" && <CustomerMessagesPanel customerId={customer.id} />}

      {tab === "actividad" && <CustomerActivityTimeline events={activityEvents} />}

      {tab === "portal" && (
        <div className="max-w-md">
          <PortalInvitePanel
            customerId={customer.id}
            customerEmail={customer.email}
            initialAccess={portalAccess}
          />
          <p className="text-xs text-text-muted mt-4">
            El cliente accede en <strong>/portal/documentos</strong> con el email del expediente.
          </p>
        </div>
      )}
    </div>
  )
}
