// app/(dashboard)/crm/[id]/CustomerEditForm.tsx
"use client"

import { useState }    from "react"
import { useRouter }   from "next/navigation"
import { Button, Input, Select, Textarea } from "@/components/ui"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast }         from "@/components/ui/Toaster"
import { Pencil, X }     from "lucide-react"

const PIPELINE_OPTIONS = [
  { value: "NEW_CONTACT", label: "Nuevo contacto"      },
  { value: "QUOTE_SENT",  label: "Presupuesto enviado" },
  { value: "CLIENT_WON",  label: "Cliente ganado"      },
  { value: "CLIENT_LOST", label: "Cliente perdido"     },
]

interface Customer {
  id: string; name: string; email?: string|null; phone?: string|null
  address?: string|null; city?: string|null; taxId?: string|null
  notes?: string|null; pipelineStage: string
}

export default function CustomerEditForm({ customer }: { customer: Customer }) {
  const router        = useRouter()
  const [open,        setOpen]        = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(false)
  const [fields,      setFields]      = useState({
    name:          customer.name,
    email:         customer.email         ?? "",
    phone:         customer.phone         ?? "",
    taxId:         customer.taxId         ?? "",
    address:       customer.address       ?? "",
    city:          customer.city          ?? "",
    pipelineStage: customer.pipelineStage,
    notes:         customer.notes         ?? "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!fields.name.trim())                             e.name  = "El nombre es obligatorio"
    if (fields.email && !/\S+@\S+\.\S+/.test(fields.email)) e.email = "Email inválido"
    return e
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const res = await fetch(`/api/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    })
    if (res.ok) {
      toast.success("Cliente actualizado")
      setOpen(false)
      router.refresh()
    } else {
      const d = await res.json()
      toast.error("Error al guardar", d.error)
    }
    setLoading(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Cliente eliminado")
      router.push("/dashboard/crm")
    } else {
      toast.error("No se pudo eliminar")
    }
    setConfirmDel(false)
  }

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
      setFields(f => ({ ...f, [k]: e.target.value }))
      if (errors[k]) setErrors(er => ({ ...er, [k]: "" }))
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary w-full justify-center">
        <Pencil size={14} />
        Editar cliente
      </button>
    )
  }

  return (
    <>
      <div className="card border-brand-200 bg-brand-50/20 space-y-4">
        <div className="flex items-center justify-between">
          <h3>Editar cliente</h3>
          <button onClick={() => setOpen(false)} className="btn-icon">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-3">
          <Input
            label="Nombre *"
            value={fields.name}
            onChange={set("name")}
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            value={fields.email}
            onChange={set("email")}
            error={errors.email}
          />
          <Input label="Teléfono"  value={fields.phone}   onChange={set("phone")}   />
          <Input label="NIF / CIF" value={fields.taxId}   onChange={set("taxId")}   />
          <Input label="Dirección" value={fields.address} onChange={set("address")} />
          <Input label="Ciudad"    value={fields.city}    onChange={set("city")}    />
          <Select
            label="Estado"
            options={PIPELINE_OPTIONS}
            value={fields.pipelineStage}
            onChange={set("pipelineStage")}
          />
          <Textarea
            label="Notas"
            value={fields.notes}
            onChange={set("notes")}
            rows={2}
          />

          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={loading} className="flex-1 justify-center">
              Guardar cambios
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => setConfirmDel(true)}
            >
              Eliminar
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmDel}
        title="Eliminar cliente"
        message={`¿Eliminar a "${customer.name}"? Se eliminarán también sus proyectos, facturas y documentos asociados.`}
        confirm="Eliminar permanentemente"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(false)}
      />
    </>
  )
}
