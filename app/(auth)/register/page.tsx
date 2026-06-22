// app/(auth)/register/page.tsx
"use client"

import { useState }  from "react"
import { useRouter } from "next/navigation"
import Link          from "next/link"
import { Eye, EyeOff, Check, ArrowRight } from "lucide-react"

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-600 mt-1">⚠ {msg}</p>
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres",        ok: password.length >= 8        },
    { label: "Mayúscula",            ok: /[A-Z]/.test(password)      },
    { label: "Número",               ok: /[0-9]/.test(password)      },
  ]
  const score = checks.filter(c => c.ok).length
  const bar   = score === 0 ? "" : score === 1 ? "bg-red-400 w-1/3" : score === 2 ? "bg-amber-400 w-2/3" : "bg-emerald-500 w-full"

  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-1 bg-surface-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${bar}`} />
      </div>
      <div className="flex gap-3">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-emerald-600" : "text-text-muted"}`}>
            <Check size={10} className={c.ok ? "opacity-100" : "opacity-30"} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [fields, setFields] = useState({
    name: "", companyName: "", email: "", password: "", confirm: "",
  })
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields(f => ({ ...f, [k]: e.target.value }))
      if (errors[k]) setErrors(er => ({ ...er, [k]: "" }))
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!fields.name.trim())                                e.name        = "El nombre es obligatorio"
    if (!fields.companyName.trim())                         e.companyName = "El nombre de empresa es obligatorio"
    if (!fields.email)                                      e.email       = "El email es obligatorio"
    else if (!/\S+@\S+\.\S+/.test(fields.email))           e.email       = "Email inválido"
    if (fields.password.length < 8)                         e.password    = "Mínimo 8 caracteres"
    if (fields.confirm !== fields.password)                 e.confirm     = "Las contraseñas no coinciden"
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name:        fields.name,
        email:       fields.email,
        password:    fields.password,
        companyName: fields.companyName,
      }),
    })

    if (!res.ok) {
      const d = await res.json()
      setErrors({ form: d.error ?? "Error al crear la cuenta" })
    } else {
      router.push("/login?registered=1")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-surface-muted p-4 py-8">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 shadow-lg mb-4">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Crea tu cuenta</h1>
          <p className="text-sm text-text-secondary mt-1">Empieza gratis · Sin tarjeta</p>
        </div>

        <div className="card shadow-modal">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Tu nombre</label>
              <input
                type="text"
                autoComplete="name"
                placeholder="Ana García"
                value={fields.name}
                onChange={set("name")}
                className={`input ${errors.name ? "input-error" : ""}`}
              />
              <FieldError msg={errors.name} />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Empresa</label>
              <input
                type="text"
                placeholder="Mi Empresa S.L."
                value={fields.companyName}
                onChange={set("companyName")}
                className={`input ${errors.companyName ? "input-error" : ""}`}
              />
              <FieldError msg={errors.companyName} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="ana@empresa.com"
                value={fields.email}
                onChange={set("email")}
                className={`input ${errors.email ? "input-error" : ""}`}
              />
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={fields.password}
                  onChange={set("password")}
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={fields.password} />
              <FieldError msg={errors.password} />
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Repetir contraseña</label>
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={fields.confirm}
                onChange={set("confirm")}
                className={`input ${errors.confirm ? "input-error" : ""}`}
              />
              <FieldError msg={errors.confirm} />
            </div>

            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700">{errors.form}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Creando cuenta...</>
                : <><ArrowRight size={16} /> Crear cuenta</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
