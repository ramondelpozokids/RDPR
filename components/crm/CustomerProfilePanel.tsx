"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Select } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import {
  ENTITY_TYPE_LABELS,
  VAT_PERIOD_LABELS,
  IRPF_REGIME_LABELS,
  ONBOARDING_STATUS_LABELS,
} from "@/lib/crm/labels"
import { CheckCircle2, Circle } from "lucide-react"

type ChecklistItem = { id: string; label: string; done: boolean }

type Profile = {
  entityType: string
  legalName: string | null
  dniNie: string | null
  cnae: string | null
  fiscalAddress: string | null
  fiscalCity: string | null
  fiscalPostalCode: string | null
  province: string | null
  vatFilingPeriod: string
  irpfRegime: string | null
  socialSecurityNum: string | null
  constitutionDate: string | null
  onboardingStatus: string
  onboardingStep: number
  checklist: ChecklistItem[] | null
}

const ENTITY_OPTIONS = Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const VAT_OPTIONS = Object.entries(VAT_PERIOD_LABELS).map(([value, label]) => ({ value, label }))
const IRPF_OPTIONS = [
  { value: "", label: "—" },
  ...Object.entries(IRPF_REGIME_LABELS).map(([value, label]) => ({ value, label })),
]

export function CustomerProfilePanel({
  customerId,
  initialProfile,
}: {
  customerId: string
  initialProfile: Profile
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState({
    entityType: initialProfile.entityType,
    legalName: initialProfile.legalName ?? "",
    dniNie: initialProfile.dniNie ?? "",
    cnae: initialProfile.cnae ?? "",
    fiscalAddress: initialProfile.fiscalAddress ?? "",
    fiscalCity: initialProfile.fiscalCity ?? "",
    fiscalPostalCode: initialProfile.fiscalPostalCode ?? "",
    province: initialProfile.province ?? "",
    vatFilingPeriod: initialProfile.vatFilingPeriod,
    irpfRegime: initialProfile.irpfRegime ?? "",
    socialSecurityNum: initialProfile.socialSecurityNum ?? "",
    constitutionDate: initialProfile.constitutionDate?.slice(0, 10) ?? "",
    onboardingStatus: initialProfile.onboardingStatus,
  })
  const checklist = (initialProfile.checklist ?? []) as ChecklistItem[]

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFields((f) => ({ ...f, [k]: e.target.value }))
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/customers/${customerId}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        irpfRegime: fields.irpfRegime || null,
        constitutionDate: fields.constitutionDate || null,
      }),
    })
    if (res.ok) {
      toast.success("Perfil fiscal guardado")
      router.refresh()
    } else {
      const d = await res.json()
      toast.error("Error", d.error)
    }
    setLoading(false)
  }

  async function toggleChecklistItem(id: string) {
    const updated = checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    const allDone = updated.every((c) => c.done)
    await fetch(`/api/customers/${customerId}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checklist: updated,
        onboardingStatus: allDone ? "COMPLETE" : updated.some((c) => c.done) ? "IN_PROGRESS" : "PENDING",
      }),
    })
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSave} className="lg:col-span-2 card space-y-4">
        <div className="flex items-center justify-between">
          <h3>Perfil fiscal del expediente</h3>
          <span className="badge-blue text-xs">
            {ONBOARDING_STATUS_LABELS[fields.onboardingStatus] ?? fields.onboardingStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Tipo entidad" options={ENTITY_OPTIONS} value={fields.entityType} onChange={set("entityType")} />
          <Input label="Razón social" value={fields.legalName} onChange={set("legalName")} />
          <Input label="DNI / NIE" value={fields.dniNie} onChange={set("dniNie")} />
          <Input label="CNAE" value={fields.cnae} onChange={set("cnae")} />
          <Input label="Dirección fiscal" value={fields.fiscalAddress} onChange={set("fiscalAddress")} />
          <Input label="Ciudad" value={fields.fiscalCity} onChange={set("fiscalCity")} />
          <Input label="C.P." value={fields.fiscalPostalCode} onChange={set("fiscalPostalCode")} />
          <Input label="Provincia" value={fields.province} onChange={set("province")} />
          <Select label="IVA" options={VAT_OPTIONS} value={fields.vatFilingPeriod} onChange={set("vatFilingPeriod")} />
          <Select label="Régimen IRPF" options={IRPF_OPTIONS} value={fields.irpfRegime} onChange={set("irpfRegime")} />
          <Input label="Nº Seg. Social" value={fields.socialSecurityNum} onChange={set("socialSecurityNum")} />
          <Input label="Fecha constitución" type="date" value={fields.constitutionDate} onChange={set("constitutionDate")} />
        </div>

        <Button type="submit" loading={loading}>Guardar perfil</Button>
      </form>

      <div className="card space-y-3">
        <h3 className="text-sm font-semibold">Checklist onboarding</h3>
        {checklist.length === 0 ? (
          <p className="text-xs text-text-muted">Sin checklist configurado.</p>
        ) : (
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-center gap-2 text-sm w-full text-left hover:text-brand-600 transition-colors"
                >
                  {item.done ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-text-muted shrink-0" />
                  )}
                  <span className={item.done ? "line-through text-text-muted" : ""}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
