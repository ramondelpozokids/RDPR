// components/ui/Spinner.tsx
"use client"

import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = { sm: "w-4 h-4 border-[1.5px]", md: "w-6 h-6 border-2", lg: "w-8 h-8 border-2" }
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-brand-500 border-t-transparent",
        sizes[size],
        className
      )}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="h-4 skeleton rounded w-1/3" />
      <div className="h-3 skeleton rounded w-2/3" />
      <div className="h-3 skeleton rounded w-1/2" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="w-8 h-8 skeleton rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 skeleton rounded w-1/4" />
        <div className="h-3 skeleton rounded w-1/3" />
      </div>
      <div className="h-5 skeleton rounded-full w-16" />
    </div>
  )
}
