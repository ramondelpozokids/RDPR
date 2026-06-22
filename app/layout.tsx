// app/layout.tsx
import type { Metadata, Viewport } from "next"
import "@/styles/globals.css"
import { Toaster } from "@/components/ui/Toaster"
import AuthSessionProvider from "@/components/providers/SessionProvider"

export const metadata: Metadata = {
  title: { default: "RDPR OS", template: "%s · RDPR OS" },
  description: "Business Operating System — finanzas, proyectos, CRM e inteligencia artificial para empresas modernas.",
  icons: {
    icon: "/favicon.webp",
    apple: "/favicon.webp",
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
