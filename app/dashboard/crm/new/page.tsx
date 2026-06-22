// app/(dashboard)/crm/new/page.tsx
"use client"

import { useState }      from "react"
import { useRouter }     from "next/navigation"
import { Button, Input, Select, Textarea, FormSection } from "@/components/ui"
import { toast }         from "@/components/ui/Toaster"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link              from "next/link"

const PIPELINE_OPTIONS = [
  { value: "NEW_CONTACT", label: "Nuevo contacto"      },
  { value: "QUOTE_SENT",  label: "Presupuesto enviado" },
  { value: "CLIENT_WON",  label: "Cliente ganado"      },
  { value: "CLIENT_LOST", label: "Cliente perdido"     },
]

interface Fields {
  name: string; email: string; phone: string; taxId: string
  address: string; city: string; pipelineStage: string; notes: string
}

const INITIAL: Fields = {
  name: "", email: "", phone: "", taxId: "",
  address: "", city: "", pipelineStage: "NEW_CONTACT", notes: "",
}

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (!f.name.trim())                              e.name  = "El nombre es obligatorio"
  if (f.email && !/\S+@\S+\.\S+/.test(f.email))   e.email = "Email inválido"
  if (f.phone && !/^[+\d\s\-()]{6,}$/.test(f.phone)) e.phone = "Teléfono inválido"
  return e
}

export default function NewCustomerPage() {
  const router  = useRouter()
  const [fields,  setFields]  = useState<Fields>(INITIAL)
  const [errors,  setErrors]  = useState<Partial<Record<keyof Fields, string>>>({})
  const [loading, setLoading] = useState(false)

  function set(k: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFields(f => ({ ...f, [k]: e.target.value }))
      if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }))
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    })

    if (res.ok) {
      toast.success("Cliente creado", fields.name)
      router.push("/dashboard/crm")
      router.refresh()
    } else {
      const d = await res.json()
      toast.error("Error al guardar", d.error ?? "Inténtalo de nuevo")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/crm" className="btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1>Nuevo cliente</h1>
          <p className="text-sm text-text-secondary mt-0.5">Añade un contacto al CRM</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Datos de contacto */}
        <div className="card space-y-4">
          <FormSection title="Datos del contacto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                placeholder="Ana García / Empresa S.L."
                value={fields.name}
                onChange={set("name")}
                error={errors.name}
                autoFocus
              />
              <Input
                label="Email"
                type="email"
                placeholder="ana@empresa.com"
                value={fields.email}
                onChange={set("email")}
                error={errors.email}
              />
              <Input
                label="Teléfono"
                placeholder="+34 600 000 000"
                value={fields.phone}
                onChange={set("phone")}
                error={errors.phone}
              />
              <Input
                label="NIF / CIF"
                placeholder="B12345678"
                value={fields.taxId}
                onChange={set("taxId")}
              />
            </div>
          </FormSection>
        </div>

        {/* Dirección */}
        <div className="card space-y-4">
          <FormSection title="Dirección">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Dirección"
                  placeholder="Calle Mayor 1, 2ºA"
                  value={fields.address}
                  onChange={set("address")}
                />
              </div>
              <Input
                label="Ciudad"
                placeholder="Madrid"
                value={fields.city}
                onChange={set("city")}
              />
            </div>
          </FormSection>
        </div>

        {/* Pipeline + Notas */}
        <div className="card space-y-4">
          <FormSection title="Estado comercial">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Estado en pipeline"
                options={PIPELINE_OPTIONS}
                value={fields.pipelineStage}
                onChange={set("pipelineStage")}
              />
            </div>
          </FormSection>
          <div className="divider" />
          <Textarea
            label="Notas internas"
            placeholder="Cómo nos conoció, qué necesita, próximos pasos..."
            value={fields.notes}
            onChange={set("notes")}
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/crm">
            <Button variant="secondary" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={loading} icon={<UserPlus size={15} />}>
            Guardar cliente
          </Button>
        </div>
      </form>
    </div>
  )
}
