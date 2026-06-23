// app/(auth)/login/page.tsx
"use client"

import { Suspense, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { SiteLogo } from "@/components/site/SiteLogo"
import { loginAction, type LoginState } from "@/lib/auth/actions"

const INITIAL_STATE: LoginState = {}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-600 mt-1 flex items-center gap-1">⚠ {msg}</p>
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full justify-center py-2.5 mt-2"
    >
      {pending
        ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Entrando...</>
        : <><ArrowRight size={16} /> Iniciar sesión</>
      }
    </button>
  )
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
  const params = useSearchParams()
  const registered = params.get("registered")
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard"
  const [state, formAction] = useFormState(loginAction, INITIAL_STATE)
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-surface-muted p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <SiteLogo size="lg" href="/" className="mb-4" />
          <h1 className="text-2xl font-bold text-text-primary">Bienvenido</h1>
          <p className="text-sm text-text-secondary mt-1">Inicia sesión en RDPR OS</p>
        </div>

        <div className="card shadow-modal">
          {registered && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-emerald-700 font-medium">✓ Cuenta creada. Ya puedes iniciar sesión.</p>
            </div>
          )}

          <form action={formAction} className="space-y-4" noValidate>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                className={`input ${state.fieldErrors?.email ? "input-error" : ""}`}
              />
              <FieldError msg={state.fieldErrors?.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input pr-10 ${state.fieldErrors?.password ? "input-error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <FieldError msg={state.fieldErrors?.password} />
            </div>

            {/* Form-level error */}
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <SubmitButton />
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
