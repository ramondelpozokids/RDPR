// components/ui/SearchInput.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  placeholder?: string
  value:        string
  onChange:     (v: string) => void
  className?:   string
  debounce?:    number
}

export function SearchInput({
  placeholder = "Buscar...",
  value,
  onChange,
  className,
  debounce = 0,
}: SearchInputProps) {
  const [local, setLocal]   = useState(value)
  const timerRef            = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => { setLocal(value) }, [value])

  function handleChange(v: string) {
    setLocal(v)
    if (debounce > 0) {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onChange(v), debounce)
    } else {
      onChange(v)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      <input
        type="text"
        className="input pl-8 pr-8"
        placeholder={placeholder}
        value={local}
        onChange={e => handleChange(e.target.value)}
      />
      {local && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
