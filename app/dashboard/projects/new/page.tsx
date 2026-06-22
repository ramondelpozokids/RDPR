// app/(dashboard)/projects/new/page.tsx
"use client"

import { useState, useEffect, Suspense }  from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button, Input, Select, Textarea, FormSection } from "@/components/ui"
import { toast }                from "@/components/ui/Toaster"
import { ArrowLeft, FolderPlus } from "lucide-react"
import Link                     from "next/link"

const STATUS_OPTIONS = [
  { value: "PENDING",     label: "Pendiente"  },
  { value: "IN_PROGRESS", label: "En proceso" },
  { value: "COMPLETED",   label: "Finalizado" },
  { value: "CANCELLED",   label: "Cancelado"  },
]

interface Fields {
  name: string; description: string; customerId: string
  status: string; startDate: string; endDate: string
}

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (!f.name.trim()) e.name = "El nombre del proyecto es obligatorio"
  if (f.startDate && f.endDate && f.endDate < f.startDate)
    e.endDate = "La fecha de fin no puede ser anterior al inicio"
  return e
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-secondary">Cargando...</div>}>
      <NewProjectForm />
    </Suspense>
  )
}

function NewProjectForm() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [fields,    setFields]    = useState<Fields>({
    name: "", description: "",
    customerId: params.get("customerId") ?? "",
    status: "PENDING", startDate: "", endDate: "",
  })
  const [errors,    setErrors]    = useState<Partial<Record<keyof Fields, string>>>({})
  const [loading,   setLoading]   = useState(false)
  const [customers, setCustomers] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    fetch("/api/customers")
      .then(r => r.json())
      .then(d => {
        if (d.success) setCustomers(d.data.map((c: any) => ({ value: c.id, label: c.name })))
      })
  }, [])

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
    const body = {
      ...fields,
      customerId: fields.customerId || undefined,
      startDate:  fields.startDate  || undefined,
      endDate:    fields.endDate    || undefined,
    }
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const d = await res.json()
      toast.success("Proyecto creado", fields.name)
      router.push(`/dashboard/projects/${d.data.id}`)
      router.refresh()
    } else {
      const d = await res.json()
      toast.error("Error al crear", d.error ?? "Inténtalo de nuevo")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/projects" className="btn-icon">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1>Nuevo proyecto</h1>
          <p className="text-sm text-text-secondary mt-0.5">Crea un proyecto y asígnalo a un cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="card space-y-4">
          <FormSection title="Información del proyecto">
            <Input
              label="Nombre del proyecto *"
              placeholder='Ej: "Web para Restaurante Pepe"'
              value={fields.name}
              onChange={set("name")}
              error={errors.name}
              autoFocus
            />
            <Textarea
              label="Descripción"
              placeholder="Detalla el alcance, objetivos y entregables del proyecto..."
              value={fields.description}
              onChange={set("description")}
              rows={3}
            />
          </FormSection>
        </div>

        <div className="card space-y-4">
          <FormSection title="Configuración">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Cliente"
                options={customers}
                placeholder="Sin cliente asignado"
                value={fields.customerId}
                onChange={set("customerId")}
              />
              <Select
                label="Estado inicial"
                options={STATUS_OPTIONS}
                value={fields.status}
                onChange={set("status")}
              />
              <Input
                label="Fecha de inicio"
                type="date"
                value={fields.startDate}
                onChange={set("startDate")}
              />
              <Input
                label="Fecha de fin prevista"
                type="date"
                value={fields.endDate}
                onChange={set("endDate")}
                error={errors.endDate}
                hint={fields.startDate ? `Después del ${fields.startDate}` : undefined}
              />
            </div>
          </FormSection>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/projects">
            <Button variant="secondary" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={loading} icon={<FolderPlus size={15} />}>
            Crear proyecto
          </Button>
        </div>
      </form>
    </div>
  )
}
