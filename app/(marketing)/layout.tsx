import { SiteNavbar } from "@/components/site/SiteNavbar"
import { SiteSidebar } from "@/components/site/SiteSidebar"
import { SiteFooter } from "@/components/site/SiteFooter"
import { CookieBanner } from "@/components/site/CookieBanner"
import { ScrollToTop } from "@/components/site/ScrollToTop"
import { OrganizationJsonLd } from "@/components/site/OrganizationJsonLd"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-text-primary">
      <SiteNavbar />
      <div className="flex flex-1 pt-16">
        <SiteSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </div>
      <CookieBanner />
      <ScrollToTop />
      <OrganizationJsonLd />
    </div>
  )
}
