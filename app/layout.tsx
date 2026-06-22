// app/layout.tsx
import type { Metadata, Viewport } from "next"
import "@/styles/globals.css"
import { Toaster } from "@/components/ui/Toaster"

export const metadata: Metadata = {
  title: { default: "RDPR OS", template: "%s · RDPR OS" },
  description: "Sistema ERP SaaS modular para pequeñas y medianas empresas",
  robots: { index: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
