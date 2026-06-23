import Link from "next/link"
import { formatDate } from "@/lib/utils"
import {
  ENTITY_TYPE_LABELS,
  VAT_PERIOD_LABELS,
  IRPF_REGIME_LABELS,
  ONBOARDING_STATUS_LABELS,
  DOCUMENT_CATEGORY_LABELS,
} from "@/lib/crm/labels"
import { getUpcomingFiscalDeadlines } from "@/lib/gestoria/fiscal-deadlines"
import type { TaxEntityType, VatFilingPeriod } from "@prisma/client"
import { Calendar, FileText, Receipt } from "lucide-react"

type Profile = {
  entityType: string
  vatFilingPeriod: string
  irpfRegime: string | null
  onboardingStatus: string
  dniNie: string | null
  cnae: string | null
}

type TaxFiling = {
  id: string
  modelId: string
  periodYear: number
  periodQuarter: number | null
  periodMonth: number | null
  status: string
  submittedAt: Date | null
}

type TaxDoc = {
  id: string
  name: string
  category: string
  createdAt: Date
}

export function CustomerFiscalPanel({
  customerId,
  profile,
  taxFilings,
  taxDocuments,
}: {
  customerId: string
  profile: Profile | null
  taxFilings: TaxFiling[]
  taxDocuments: TaxDoc[]
}) {
  const entityType = (profile?.entityType ?? "AUTONOMO") as TaxEntityType
  const vatPeriod = (profile?.vatFilingPeriod ?? "QUARTERLY") as VatFilingPeriod
  const deadlines = getUpcomingFiscalDeadlines({ entityType, vatFilingPeriod: vatPeriod }, new Date(), 120)

  const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendiente",
    SUBMITTED: "Presentado",
    ACCEPTED: "Aceptado",
    REJECTED: "Rechazado",
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <h3 className="flex items-center gap-2">
          <Receipt size={16} className="text-text-muted" />
          Perfil fiscal
        </h3>
        {profile ? (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-text-muted text-xs">Entidad</dt>
              <dd className="font-medium">{ENTITY_TYPE_LABELS[profile.entityType]}</dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs">IVA</dt>
              <dd className="font-medium">{VAT_PERIOD_LABELS[profile.vatFilingPeriod]}</dd>
            </div>
            {profile.irpfRegime && (
              <div>
                <dt className="text-text-muted text-xs">IRPF</dt>
                <dd className="font-medium">{IRPF_REGIME_LABELS[profile.irpfRegime]}</dd>
              </div>
            )}
            {profile.dniNie && (
              <div>
                <dt className="text-text-muted text-xs">DNI/NIE</dt>
                <dd className="font-medium">{profile.dniNie}</dd>
              </div>
            )}
            {profile.cnae && (
              <div>
                <dt className="text-text-muted text-xs">CNAE</dt>
                <dd className="font-medium">{profile.cnae}</dd>
              </div>
            )}
            <div>
              <dt className="text-text-muted text-xs">Onboarding</dt>
              <dd className="font-medium">{ONBOARDING_STATUS_LABELS[profile.onboardingStatus]}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-text-muted">
            Completa el{" "}
            <Link href={`/dashboard/crm/${customerId}?tab=perfil`} className="text-brand-600 hover:underline">
              perfil fiscal
            </Link>{" "}
            para calcular vencimientos.
          </p>
        )}
      </div>

      <div className="card space-y-4">
        <h3 className="flex items-center gap-2">
          <Calendar size={16} className="text-text-muted" />
          Próximos vencimientos
        </h3>
        {deadlines.length === 0 ? (
          <p className="text-sm text-text-muted">Sin vencimientos en los próximos 120 días.</p>
        ) : (
          <ul className="space-y-2">
            {deadlines.slice(0, 6).map((d, i) => (
              <li key={i} className="flex justify-between items-center text-sm py-2 border-b border-surface-border last:border-0">
                <div>
                  <p className="font-medium">{d.label}</p>
                  <p className="text-xs text-text-muted">{d.periodLabel}</p>
                </div>
                <span className="text-xs font-mono text-amber-700">{formatDate(d.dueDate)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card space-y-4 lg:col-span-2">
        <h3 className="flex items-center gap-2">
          <FileText size={16} className="text-text-muted" />
          Presentaciones registradas
        </h3>
        {taxFilings.length === 0 ? (
          <p className="text-sm text-text-muted">
            Aún no hay modelos presentados para este cliente. Usa el módulo fiscal para generar y registrar presentaciones.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs text-text-muted">
                  <th className="py-2 pr-4">Modelo</th>
                  <th className="py-2 pr-4">Periodo</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2">Presentado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {taxFilings.map((f) => (
                  <tr key={f.id}>
                    <td className="py-2 pr-4 font-mono">{f.modelId}</td>
                    <td className="py-2 pr-4">
                      {f.periodQuarter ? `T${f.periodQuarter} ${f.periodYear}` : `${f.periodMonth}/${f.periodYear}`}
                    </td>
                    <td className="py-2 pr-4">{STATUS_LABELS[f.status] ?? f.status}</td>
                    <td className="py-2">{f.submittedAt ? formatDate(f.submittedAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {taxDocuments.length > 0 && (
        <div className="card space-y-3 lg:col-span-2">
          <h3>Documentos fiscales</h3>
          <ul className="divide-y divide-surface-border">
            {taxDocuments.map((d) => (
              <li key={d.id} className="py-2 flex justify-between text-sm">
                <span>{d.name}</span>
                <span className="text-xs text-text-muted">
                  {DOCUMENT_CATEGORY_LABELS[d.category] ?? d.category} · {formatDate(d.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
