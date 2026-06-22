"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"

const CONSENT_KEY = "rdpr-cookie-consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) setVisible(true)
  }, [])

  function accept(type: "all" | "essential") {
    localStorage.setItem(CONSENT_KEY, type)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 pointer-events-none"
    >
      <div className="max-w-2xl mx-auto pointer-events-auto rounded-2xl border border-surface-border bg-white/95 backdrop-blur-xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.18)] p-5 sm:p-6 animate-in">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 items-center justify-center shrink-0">
            <Cookie size={18} className="text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 id="cookie-banner-title" className="font-semibold text-text-primary text-sm sm:text-base">
                Privacidad y cookies
              </h2>
              <button
                type="button"
                onClick={() => accept("essential")}
                className="text-text-muted hover:text-text-primary shrink-0"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
              Utilizamos cookies técnicas imprescindibles para la sesión y seguridad de RDPR OS. Con su consentimiento,
              podemos usar cookies analíticas para mejorar la experiencia. Consulte nuestra{" "}
              <Link href="/legal/cookies" className="text-brand-600 hover:underline font-medium">
                política de cookies
              </Link>{" "}
              y{" "}
              <Link href="/legal/privacidad" className="text-brand-600 hover:underline font-medium">
                política de privacidad
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button type="button" onClick={() => accept("essential")} className="btn-secondary text-sm py-2 flex-1 justify-center">
                Solo necesarias
              </button>
              <button type="button" onClick={() => accept("all")} className="btn-primary text-sm py-2 flex-1 justify-center">
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
