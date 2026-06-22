"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { SITE_IMAGES } from "@/lib/site/config"

const QUESTION = "¿Cuál fue mi beneficio el último trimestre?"
const ANSWER =
  "Tu beneficio neto en Q1 fue 18.420 € (+12,4% vs Q4). CourtManager Pro aportó el 61%. BOOKIA Publisher creció un 23%. ¿Genero el informe ejecutivo?"

export default function AIChatDemo() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 3800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="rounded-2xl border border-surface-border bg-white shadow-modal overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-surface-border bg-surface-muted/50">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-surface-border">
          <Image src={SITE_IMAGES.chatAssistant} alt="Asistente RDPR" fill className="object-cover" sizes="36px" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">RDPR Intelligence</p>
          <p className="text-[11px] text-text-muted">Asistente empresarial</p>
        </div>
        <span className="ml-auto text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          En línea
        </span>
      </div>

      <div className="p-5 space-y-4 min-h-[220px]">
        {phase >= 1 && (
          <div className="flex justify-end animate-in">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-500 text-white px-4 py-2.5 text-sm">
              {QUESTION}
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="flex gap-2 items-center text-text-muted text-sm pl-1">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:300ms]" />
            </span>
            Analizando datos…
          </div>
        )}

        {phase >= 3 && (
          <div className="flex justify-start animate-in">
            <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-surface-muted border border-surface-border px-4 py-3 text-sm text-text-primary leading-relaxed">
              {ANSWER}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
