// app/layout.tsx
import type { Metadata, Viewport } from "next"
import "@/styles/globals.css"
import { Toaster } from "@/components/ui/Toaster"
import AuthSessionProvider from "@/components/providers/SessionProvider"
import { SITE_URL, DEFAULT_OG, DEFAULT_TWITTER } from "@/lib/site/seo"
import { SITE_KEYWORDS } from "@/lib/site/marketing-content"
import { SITE_IMAGES, SITE_NAME } from "@/lib/site/config"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Gestoría y asesoría digital`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Asesoría contable, fiscal y software de gestión empresarial. Facturación electrónica, modelos AEAT, documentos cifrados e inteligencia artificial.",
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: "RDPR Digital S.L." }],
  creator: "RDPR Digital S.L.",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    ...DEFAULT_OG,
    title: `${SITE_NAME} — Gestoría y asesoría digital`,
    description:
      "Asesoría contable, fiscal y gestión empresarial con RDPR OS. Plataforma funcional, no demo.",
    images: [{ url: SITE_IMAGES.hero, width: 1200, height: 630, alt: "RDPR OS" }],
  },
  twitter: DEFAULT_TWITTER,
  alternates: { canonical: SITE_URL },
  icons: {
    icon: "/favicon.webp",
    apple: "/favicon.webp",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1929",
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
