// components/ui/index.tsx
// Central export for all reusable UI primitives
"use client"

import { cn } from "@/lib/utils"
import { X, ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// ─────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?:    "xs" | "sm" | "md" | "lg"
  loading?: boolean
  icon?:    React.ReactNode
}

export function Button({
  variant = "primary", size = "md", loading, icon,
  className, children, disabled, ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
  const variants = {
    primary:   "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm",
    secondary: "bg-white text-text-primary border border-surface-border hover:bg-surface-muted shadow-sm",
    danger:    "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    ghost:     "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
  }
  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  }
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading
        ? <svg className="animate-spin w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        : icon
      }
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:  string
  error?:  string
  hint?:   string
  suffix?: React.ReactNode
}

export function Input({ label, error, hint, suffix, className, id, ...props }: InputProps) {
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined)
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          {...props}
          className={cn(
            "input",
            error   && "border-red-400 focus:ring-red-400/30 focus:border-red-400",
            suffix  && "pr-10",
            className
          )}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?:  string
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id ?? (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined)
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        {...props}
        className={cn(
          "input resize-none leading-relaxed",
          error && "border-red-400 focus:ring-red-400/30",
          className
        )}
      />
      {error && <p className="text-xs text-red-600">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string
  error?:       string
  options:      { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const inputId = id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined)
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <select
        id={inputId}
        {...props}
        className={cn("input bg-white cursor-pointer", error && "border-red-400", className)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-600">⚠ {error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
interface ModalProps {
  open:     boolean
  onClose:  () => void
  title:    string
  children: React.ReactNode
  size?:    "sm" | "md" | "lg" | "xl"
  footer?:  React.ReactNode
}

export function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", h)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = "" }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm fade-in" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-modal w-full animate-in", sizes[size])}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="btn-icon"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-surface-border bg-surface-muted/50 rounded-b-2xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────
type BadgeVariant = "green" | "yellow" | "red" | "blue" | "gray" | "violet"

export function Badge({ children, variant = "gray" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return <span className={`badge-${variant}`}>{children}</span>
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────
export function EmptyState({
  icon, title, description, action,
}: {
  icon?:        React.ReactNode
  title:        string
  description?: string
  action?:      React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center text-text-muted mb-4">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
      {description && <p className="text-xs text-text-muted mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ─────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────
export function PageHeader({
  title, subtitle, action, back,
}: {
  title:     string
  subtitle?: string
  action?:   React.ReactNode
  back?:     React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        {back}
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────
// FORM SECTION
// ─────────────────────────────────────────────
export function FormSection({
  title, children, className,
}: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="section-title">{title}</p>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// DROPDOWN MENU
// ─────────────────────────────────────────────
interface DropdownItem {
  label:    string
  icon?:    React.ReactNode
  onClick:  () => void
  danger?:  boolean
  divider?: boolean
}

export function DropdownMenu({
  trigger, items,
}: { trigger: React.ReactNode; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="dropdown-menu absolute right-0 top-full mt-1 animate-in z-20">
          {items.map((item, i) => (
            <div key={i}>
              {item.divider && <div className="border-t border-surface-border my-1" />}
              <button
                onClick={() => { item.onClick(); setOpen(false) }}
                className={item.danger ? "dropdown-item-danger" : "dropdown-item"}
              >
                {item.icon}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────
interface Tab { key: string; label: string; icon?: React.ReactNode }

export function Tabs({
  tabs, active, onChange,
}: { tabs: Tab[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-surface-muted border border-surface-border rounded-xl">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
            active === t.key
              ? "bg-white text-text-primary shadow-card"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// ALERT BANNER
// ─────────────────────────────────────────────
type AlertVariant = "info" | "warning" | "error" | "success"

export function Alert({
  variant = "info", title, children,
}: { variant?: AlertVariant; title?: string; children: React.ReactNode }) {
  const styles: Record<AlertVariant, string> = {
    info:    "bg-brand-50 border-brand-200 text-brand-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  }
  return (
    <div className={cn("border rounded-xl px-4 py-3", styles[variant])}>
      {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
      <p className="text-sm">{children}</p>
    </div>
  )
}
