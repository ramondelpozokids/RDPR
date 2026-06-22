// app/(dashboard)/settings/SettingsClient.tsx
"use client"

import { useState }      from "react"
import { useRouter }     from "next/navigation"
import { Button, Input, Select, Tabs, Alert } from "@/components/ui"
import { toast }         from "@/components/ui/Toaster"
import { getInitials }   from "@/lib/utils"
import {
  Building2, Users, Lock, CreditCard,
  Check, Eye, EyeOff, Shield, Zap, Tag,
} from "lucide-react"
import { BrandsSettings } from "@/components/settings/BrandsSettings"
import { DEFAULT_LEGAL_NAME } from "@/lib/brands/catalog"

interface Company {
  id: string; name: string; legalName?: string | null; taxId?: string | null; email?: string | null
  phone?: string | null; address?: string | null; city?: string | null
  postalCode?: string | null; country: string; currency: string; taxRate: number
  taxEntityType?: string; vatFilingPeriod?: string; irpfRegime?: string | null
}
interface UserRow { id: string; name: string | null; email: string; role: string }
interface Props {
  company: Company
  organization?: { id: string; name: string; slug: string; type: string } | null
  currentUserId: string
  currentRole: string
  users: UserRow[]
  brands: Array<{ id: string; name: string; slug: string; type: string; tagline: string | null; brandColor: string }>
}

const TABS = [
  { key: "company",  label: "Empresa",   icon: <Building2  size={14} /> },
  { key: "brands",   label: "Marcas",    icon: <Tag        size={14} /> },
  { key: "users",    label: "Usuarios",  icon: <Users      size={14} /> },
  { key: "security", label: "Seguridad", icon: <Lock       size={14} /> },
  { key: "plan",     label: "Plan",      icon: <CreditCard size={14} /> },
]

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "Euro (€)"   },
  { value: "USD", label: "Dólar ($)"  },
  { value: "GBP", label: "Libra (£)"  },
  { value: "MXN", label: "Peso MX ($)"},
]

export default function SettingsClient({ company, organization, currentUserId, currentRole, users, brands }: Props) {
  const router  = useRouter()
  const isAdmin = currentRole === "ADMIN"
  const [tab, setTab] = useState("company")

  // ── Company form state ──────────────────────
  const [compSaving, setCompSaving] = useState(false)

  async function handleCompanySave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCompSaving(true)
    const fd   = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())
    const payload: Record<string, unknown> = { ...body, taxRate: Number(body.taxRate) }
    if (body.irpfRegime === "") payload.irpfRegime = null
    if (body.legalName) {
      payload.name = body.legalName
      payload.legalName = body.legalName
    }
    const res  = await fetch(`/api/companies/${company.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      toast.success("Empresa actualizada")
      router.refresh()
    } else {
      const d = await res.json()
      toast.error("Error al guardar", d.error ?? "Inténtalo de nuevo")
    }
    setCompSaving(false)
  }

  // ── Password form state ─────────────────────
  const [pwdSaving, setPwdSaving] = useState(false)
  const [showPwd,   setShowPwd]   = useState(false)
  const [pwdFields, setPwdFields] = useState({ current: "", next: "", confirm: "" })
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({})

  function validatePwd() {
    const e: Record<string, string> = {}
    if (!pwdFields.current)                       e.current = "Introduce tu contraseña actual"
    if (pwdFields.next.length < 8)                e.next    = "Mínimo 8 caracteres"
    if (pwdFields.next !== pwdFields.confirm)      e.confirm = "Las contraseñas no coinciden"
    return e
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    const errs = validatePwd()
    if (Object.keys(errs).length) { setPwdErrors(errs); return }

    setPwdSaving(true)
    setPwdErrors({})
    const res = await fetch("/api/auth/change-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwdFields.current, newPassword: pwdFields.next }),
    })
    if (res.ok) {
      toast.success("Contraseña actualizada")
      setPwdFields({ current: "", next: "", confirm: "" })
    } else {
      const d = await res.json()
      toast.error("Error", d.error ?? "Contraseña actual incorrecta")
    }
    setPwdSaving(false)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1>Configuración</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {organization ? `${organization.name} · ` : ""}Gestiona tu empresa, equipo y cuenta
        </p>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-6" />

      {/* ── EMPRESA ────────────────────────────── */}
      {tab === "company" && (
        <form onSubmit={handleCompanySave} className="card space-y-5">
          <p className="section-title">Razón social y datos fiscales</p>
          <Alert variant="info">
            Todas las marcas comerciales (RDPR Finance, CourtManager Pro, etc.) facturan bajo esta razón social.
          </Alert>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="legalName"
              label="Razón social *"
              defaultValue={company.legalName ?? company.name ?? DEFAULT_LEGAL_NAME}
              required
              disabled={!isAdmin}
              className="sm:col-span-2"
              hint="Ej: RDPR Digital S.L. — aparece en facturas y modelos AEAT"
            />
            <Input name="taxId"   label="NIF / CIF"              defaultValue={company.taxId   ?? ""} disabled={!isAdmin} />
            <Input name="email"   label="Email de contacto" type="email" defaultValue={company.email ?? ""} disabled={!isAdmin} />
            <Input name="phone"   label="Teléfono"               defaultValue={company.phone   ?? ""} disabled={!isAdmin} />
            <Input name="address" label="Dirección"              defaultValue={company.address ?? ""} disabled={!isAdmin} className="sm:col-span-2" />
            <Input name="city"       label="Ciudad"         defaultValue={company.city       ?? ""} disabled={!isAdmin} />
            <Input name="postalCode" label="Código postal"  defaultValue={company.postalCode ?? ""} disabled={!isAdmin} />
            <Select
              name="currency" label="Moneda"
              defaultValue={company.currency}
              options={CURRENCY_OPTIONS}
              disabled={!isAdmin}
            />
            <Input
              name="taxRate" label="IVA por defecto (%)"
              type="number" min="0" max="100" step="0.1"
              defaultValue={company.taxRate}
              disabled={!isAdmin}
              hint="Se aplica automáticamente en nuevas facturas"
            />
          </div>

          <p className="section-title pt-2 border-t border-surface-border">Perfil fiscal (España)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              name="taxEntityType"
              label="Tipo de contribuyente"
              defaultValue={company.taxEntityType ?? "SL"}
              disabled={!isAdmin}
              options={[
                { value: "AUTONOMO", label: "Autónomo" },
                { value: "SL", label: "Sociedad Limitada (SL)" },
                { value: "SA", label: "Sociedad Anónima (SA)" },
                { value: "OTHER", label: "Otra entidad" },
              ]}
            />
            <Select
              name="vatFilingPeriod"
              label="Liquidación IVA"
              defaultValue={company.vatFilingPeriod ?? "QUARTERLY"}
              disabled={!isAdmin}
              options={[
                { value: "QUARTERLY", label: "Trimestral (303)" },
                { value: "MONTHLY", label: "Mensual (303)" },
              ]}
            />
            <Select
              name="irpfRegime"
              label="Régimen IRPF (autónomos)"
              defaultValue={company.irpfRegime ?? ""}
              disabled={!isAdmin}
              options={[
                { value: "", label: "No aplica / sin definir" },
                { value: "DIRECT_ESTIMATION", label: "Estimación directa (130)" },
                { value: "OBJECTIVE_MODULES", label: "Estimación objetiva / módulos (131)" },
              ]}
            />
          </div>
          <Alert variant="info">
            El perfil fiscal personaliza los modelos en RDPR Tax Intelligence (303, 130, 200, 347…).
          </Alert>

          {isAdmin ? (
            <div className="flex justify-end pt-2 border-t border-surface-border">
              <Button type="submit" loading={compSaving}>
                Guardar cambios
              </Button>
            </div>
          ) : (
            <Alert variant="info">
              Solo los administradores pueden editar los datos de la empresa.
            </Alert>
          )}
        </form>
      )}

      {tab === "brands" && (
        <BrandsSettings
          legalName={company.legalName ?? null}
          companyName={company.name}
          brands={brands}
        />
      )}

      {/* ── USUARIOS ────────────────────────────── */}
      {tab === "users" && (
        <div className="space-y-4">
          {/* Team table */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
              <h3>Miembros del equipo</h3>
              <span className="badge-blue">
                {users.length} usuario{users.length !== 1 ? "s" : ""}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted">
                  <th className="table-header">Nombre</th>
                  <th className="table-header hidden sm:table-cell">Email</th>
                  <th className="table-header">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{getInitials(u.name)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {u.name ?? "Sin nombre"}
                            {u.id === currentUserId && (
                              <span className="ml-2 text-xs text-brand-500 font-normal">(tú)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-text-secondary hidden sm:table-cell">{u.email}</td>
                    <td className="table-cell">
                      <span className={u.role === "ADMIN" ? "badge-blue" : "badge-gray"}>
                        {u.role === "ADMIN" ? "Admin" : "Empleado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Alert variant="warning" title="Invitar usuarios">
            Por ahora, registra nuevos usuarios en <strong>/register</strong>. La invitación por email llegará próximamente.
          </Alert>
        </div>
      )}

      {/* ── SEGURIDAD ─────────────────────────── */}
      {tab === "security" && (
        <div className="space-y-4">
          <div className="card space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-brand-500" />
              <p className="section-title mb-0">Cambiar contraseña</p>
            </div>

            <form onSubmit={handlePasswordChange} noValidate className="space-y-4">
              {/* Current */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Contraseña actual</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={pwdFields.current}
                    onChange={e => { setPwdFields(f => ({ ...f, current: e.target.value })); setPwdErrors(er => ({ ...er, current: "" })) }}
                    className={`input pr-10 ${pwdErrors.current ? "input-error" : ""}`}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwdErrors.current && <p className="text-xs text-red-600">⚠ {pwdErrors.current}</p>}
              </div>

              {/* New */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Nueva contraseña</label>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={pwdFields.next}
                  onChange={e => { setPwdFields(f => ({ ...f, next: e.target.value })); setPwdErrors(er => ({ ...er, next: "" })) }}
                  className={`input ${pwdErrors.next ? "input-error" : ""}`}
                  autoComplete="new-password"
                />
                {pwdErrors.next && <p className="text-xs text-red-600">⚠ {pwdErrors.next}</p>}
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Confirmar nueva contraseña</label>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={pwdFields.confirm}
                  onChange={e => { setPwdFields(f => ({ ...f, confirm: e.target.value })); setPwdErrors(er => ({ ...er, confirm: "" })) }}
                  className={`input ${pwdErrors.confirm ? "input-error" : ""}`}
                  autoComplete="new-password"
                />
                {pwdErrors.confirm && <p className="text-xs text-red-600">⚠ {pwdErrors.confirm}</p>}
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" loading={pwdSaving}>
                  Actualizar contraseña
                </Button>
              </div>
            </form>
          </div>

          <div className="card space-y-3">
            <p className="section-title">Información de seguridad</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Check size={14} className="text-emerald-500" />
                Contraseñas cifradas con bcrypt
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Check size={14} className="text-emerald-500" />
                Sesiones JWT seguras
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Check size={14} className="text-emerald-500" />
                Datos aislados por empresa
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Check size={14} className="text-emerald-500" />
                HTTPS obligatorio en producción
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN ──────────────────────────────── */}
      {tab === "plan" && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-lg font-bold text-text-primary">Plan Beta · Gratuito</p>
                <p className="text-sm text-text-secondary mt-1">
                  Acceso completo durante el periodo de prueba
                </p>
              </div>
              <span className="badge-green text-xs px-3 py-1">Activo</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                "CRM de clientes ilimitado",
                "Proyectos y tareas kanban",
                "Facturación con PDF profesional",
                "Almacenamiento de documentos",
                "Múltiples usuarios",
                "Dashboard con estadísticas",
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check size={13} className="text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="card border-brand-200 bg-gradient-to-br from-brand-50 via-white to-violet-50 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <Zap size={40} className="text-brand-200 opacity-50" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-violet">Próximamente</span>
              <span className="text-xs text-text-muted">Q2 2025</span>
            </div>
            <p className="font-bold text-brand-900 text-lg">Plan Pro</p>
            <p className="text-sm text-brand-700 mt-1 mb-4">
              Almacenamiento ilimitado · IA integrada · Módulo restaurante ·
              Inventario · RRHH · API access · Soporte prioritario
            </p>
            <button className="btn-primary opacity-60 cursor-not-allowed" disabled>
              Próximamente disponible
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
