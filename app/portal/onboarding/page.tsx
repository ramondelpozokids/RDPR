"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Select } from "@/components/ui"
import { toast } from "@/components/ui/Toaster"
import { CheckCircle2 } from "lucide-react"

const STEPS = [
  { title: "Datos fiscales", desc: "Confirme su información fiscal básica" },
  { title: "Identidad", desc: "Suba DNI/NIE en Documentos → carpeta Identidad" },
  { title: "Autorización", desc: "Firme la autorización para que actuemos en su nombre" },
  { title: "Banco", desc: "Registre su IBAN (opcional)" },
  { title: "Completado", desc: "¡Alta finalizada!" },
]

const ENTITY_OPTIONS = [
  { value: "AUTONOMO", label: "Autónomo" },
  { value: "SL", label: "Sociedad Limitada" },
  { value: "SA", label: "Sociedad Anónima" },
  { value: "OTHER", label: "Otro" },
]

export default function PortalOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState({
    legalName: "",
    dniNie: "",
    fiscalAddress: "",
    fiscalCity: "",
    fiscalPostalCode: "",
    entityType: "AUTONOMO",
  })

  useEffect(() => {
    fetch("/api/portal/onboarding")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.profile) {
          const p = json.data.profile
          setStep(p.onboardingStep ?? 0)
          setFields((f) => ({
            ...f,
            legalName: p.legalName ?? "",
            dniNie: p.dniNie ?? "",
            fiscalAddress: p.fiscalAddress ?? "",
            fiscalCity: p.fiscalCity ?? "",
            fiscalPostalCode: p.fiscalPostalCode ?? "",
            entityType: p.entityType ?? "AUTONOMO",
          }))
          if (p.onboardingStatus === "COMPLETE") setStep(4)
        }
        if (json.data?.customer?.name && !fields.legalName) {
          setFields((f) => ({ ...f, legalName: json.data.customer.name }))
        }
      })
      .catch(() => {})
  }, [])

  async function saveStep(nextStep: number, extra: Record<string, unknown> = {}) {
    setLoading(true)
    const res = await fetch("/api/portal/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: nextStep, ...fields, ...extra }),
    })
    const json = await res.json()
    if (res.ok) {
      setStep(nextStep)
      if (json.data?.authorization?.signingUrl) {
        toast.success("Solicitud de firma creada")
        router.push("/portal/firmas")
      }
    } else {
      toast.error("Error", json.error)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1>Alta en la gestoría</h1>
        <p className="text-sm text-text-secondary mt-1">
          Paso {Math.min(step + 1, STEPS.length)} de {STEPS.length}: {STEPS[step]?.title}
        </p>
        <div className="flex gap-1 mt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand-500" : "bg-surface-border"}`}
            />
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <p className="text-sm text-text-secondary">{STEPS[step]?.desc}</p>

        {step === 0 && (
          <>
            <Select
              label="Tipo de entidad"
              options={ENTITY_OPTIONS}
              value={fields.entityType}
              onChange={(e) => setFields((f) => ({ ...f, entityType: e.target.value }))}
            />
            <Input label="Nombre / Razón social" value={fields.legalName} onChange={(e) => setFields((f) => ({ ...f, legalName: e.target.value }))} />
            <Input label="DNI / NIE" value={fields.dniNie} onChange={(e) => setFields((f) => ({ ...f, dniNie: e.target.value }))} />
            <Input label="Dirección fiscal" value={fields.fiscalAddress} onChange={(e) => setFields((f) => ({ ...f, fiscalAddress: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ciudad" value={fields.fiscalCity} onChange={(e) => setFields((f) => ({ ...f, fiscalCity: e.target.value }))} />
              <Input label="C.P." value={fields.fiscalPostalCode} onChange={(e) => setFields((f) => ({ ...f, fiscalPostalCode: e.target.value }))} />
            </div>
            <Button onClick={() => saveStep(1)} loading={loading} className="w-full justify-center">
              Continuar
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-sm">
              Vaya a <strong>Documentos</strong> y suba su DNI/NIE en la carpeta <strong>Identidad</strong>.
            </p>
            <a href="/portal/documentos" className="btn-secondary w-full justify-center inline-flex">
              Ir a documentos
            </a>
            <Button onClick={() => saveStep(2)} loading={loading} className="w-full justify-center">
              Ya he subido mi documento
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm">
              Necesitamos su firma en la autorización para presentar impuestos y gestionar trámites en su nombre.
            </p>
            <Button
              onClick={() => saveStep(3, { requestAuthorization: true })}
              loading={loading}
              className="w-full justify-center"
            >
              Solicitar firma de autorización
            </Button>
            <Button variant="secondary" onClick={() => saveStep(3)} className="w-full justify-center">
              Ya firmé
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm">Opcional: registre su cuenta bancaria para conciliación automática.</p>
            <a href="/portal/banco" className="btn-secondary w-full justify-center inline-flex">
              Registrar IBAN
            </a>
            <Button onClick={() => saveStep(4)} loading={loading} className="w-full justify-center">
              Omitir y finalizar
            </Button>
          </>
        )}

        {step >= 4 && (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
            <p className="font-medium">Alta completada</p>
            <p className="text-sm text-text-muted">Su gestoría ya puede trabajar con su expediente.</p>
            <a href="/portal/documentos" className="btn-primary inline-flex mt-4">
              Ir al portal
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
