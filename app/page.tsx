import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/config"
import LandingPage from "@/components/landing/LandingPage"

export const metadata: Metadata = {
  title: "RDPR OS — La plataforma inteligente para dirigir empresas",
  description:
    "Gestiona operaciones, contabilidad, proyectos, clientes y crecimiento empresarial con inteligencia artificial avanzada. Business Operating System para empresas modernas.",
  openGraph: {
    title: "RDPR OS",
    description: "La inteligencia operativa para empresas que quieren crecer.",
    type: "website",
  },
  robots: { index: true, follow: true },
}

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")
  return <LandingPage />
}
