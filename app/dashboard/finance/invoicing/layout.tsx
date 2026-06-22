import { FinanceNav } from "@/components/finance/FinanceNav"

export default function InvoicingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <FinanceNav />
      {children}
    </div>
  )
}
