// app/(auth)/login/page.tsx
"use client"

import { Suspense, useState } from "react"
import { signIn }   from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠ {msg}</p>
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-surface-muted">
        <p className="text-sm text-text-secondary">Cargando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const registered   = params.get("registered")

  const [fields, setFields]   = useState({ email: "", password: "" })
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!fields.email)                            e.email    = "El email es obligatorio"
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e.email    = "Email inválido"
    if (!fields.password)                         e.password = "La contraseña es obligatoria"
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setErrors({})

    const result = await signIn("credentials", {
      email:    fields.email,
      password: fields.password,
      redirect: false,
    })

    if (result?.error) {
      setErrors({ form: "Email o contraseña incorrectos" })
    } else {
      router.push("/dashboard")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-surface-muted p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 shadow-lg mb-4">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Bienvenido</h1>
          <p className="text-sm text-text-secondary mt-1">Inicia sesión en RDPR OS</p>
        </div>

        <div className="card shadow-modal">
          {registered && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-emerald-700 font-medium">✓ Cuenta creada. Ya puedes iniciar sesión.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                value={fields.email}
                onChange={e => {
                  setFields(f => ({ ...f, email: e.target.value }))
                  if (errors.email) setErrors(er => ({ ...er, email: "" }))
                }}
                className={`input ${errors.email ? "input-error" : ""}`}
              />
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={fields.password}
                  onChange={e => {
                    setFields(f => ({ ...f, password: e.target.value }))
                    if (errors.password) setErrors(er => ({ ...er, password: "" }))
                  }}
                  className={`input pr-10 ${errors.password ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>

            {/* Form-level error */}
            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700">{errors.form}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Entrando...</>
                : <><ArrowRight size={16} /> Iniciar sesión</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-5">
          ¿Sin cuenta?{" "}
          <Link href="/register" className="text-brand-600 font-semibold hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
