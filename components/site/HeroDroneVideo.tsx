"use client"

import { useEffect, useRef } from "react"
import { HERO_DRONE_VIDEO } from "@/lib/site/stock-videos"
import { stockUrl } from "@/lib/site/stock-images"

type HeroDroneVideoProps = {
  className?: string
}

/** Vídeo de fondo: autoplay silenciado, bucle, Madrid a vista de dron. */
export function HeroDroneVideo({ className = "" }: HeroDroneVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      autoPlay
      muted
      playsInline
      loop
      preload="auto"
      poster={stockUrl("heroAerial", 1600)}
      aria-hidden
    >
      <source src={HERO_DRONE_VIDEO.src} type="video/mp4" />
    </video>
  )
}
