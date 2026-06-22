"use client"

import { useEffect, useState } from "react"

function isBlockedShortcut(e: KeyboardEvent): boolean {
  const key = e.key.toUpperCase()
  if (key === "F12") return true
  if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(key)) return true
  if (e.ctrlKey && (key === "U" || key === "S")) return true
  if (e.metaKey && e.altKey && ["I", "J", "C"].includes(key)) return true
  if (e.metaKey && key === "U") return true
  return false
}

function devToolsLikelyOpen(): boolean {
  const gap = 160
  return (
    window.outerWidth - window.innerWidth > gap ||
    window.outerHeight - window.innerHeight > gap
  )
}

/** Disuasión en sitio público: no sustituye seguridad de servidor ni impide copia avanzada. */
export function PublicSiteGuard() {
  const [shieldActive, setShieldActive] = useState(false)

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    const onKeyDown = (e: KeyboardEvent) => {
      if (isBlockedShortcut(e)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const onCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, [data-allow-copy]")) return
      e.preventDefault()
    }

    const onDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, a, button, [data-allow-copy]")) return
      e.preventDefault()
    }

    const checkDevTools = () => setShieldActive(devToolsLikelyOpen())

    document.addEventListener("contextmenu", onContextMenu)
    document.addEventListener("keydown", onKeyDown, true)
    document.addEventListener("copy", onCopy)
    document.addEventListener("dragstart", onDragStart)
    const interval = window.setInterval(checkDevTools, 800)
    checkDevTools()

    return () => {
      document.removeEventListener("contextmenu", onContextMenu)
      document.removeEventListener("keydown", onKeyDown, true)
      document.removeEventListener("copy", onCopy)
      document.removeEventListener("dragstart", onDragStart)
      window.clearInterval(interval)
    }
  }, [])

  if (!shieldActive) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a]/95 px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md space-y-3 text-white">
        <p className="text-lg font-semibold">Contenido protegido</p>
        <p className="text-sm text-white/80 leading-relaxed">
          Este sitio está protegido. Cierre las herramientas de desarrollo para continuar navegando.
        </p>
      </div>
    </div>
  )
}
