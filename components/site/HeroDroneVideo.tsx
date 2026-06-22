"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { HERO_DRONE_VIDEO } from "@/lib/site/stock-videos"
import { SITE_IMAGES } from "@/lib/site/config"

const INTRO_HOLD_MS = 10_000

type HeroDroneVideoProps = {
  className?: string
}

/** Intro estática (torres.webp) 10 s → vídeo en bucle con fundido suave. */
export function HeroDroneVideo({ className = "" }: HeroDroneVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = useState<"intro" | "video">("intro")

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase("video"), INTRO_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (phase !== "video") return
    const video = ref.current
    if (!video) return
    video.currentTime = 0
    video.play().catch(() => {})
  }, [phase])

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Image
        src={SITE_IMAGES.torres}
        alt=""
        fill
        className={`object-cover transition-opacity duration-[2000ms] ${
          phase === "intro" ? "opacity-100" : "opacity-0"
        }`}
        priority
        sizes="100vw"
        aria-hidden
      />
      <video
        ref={ref}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ${
          phase === "video" ? "opacity-100" : "opacity-0"
        }`}
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden
      >
        <source src={HERO_DRONE_VIDEO.src} type="video/mp4" />
      </video>
    </div>
  )
}
