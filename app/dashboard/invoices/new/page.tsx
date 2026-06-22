import { redirect } from "next/navigation"

export default function LegacyNewInvoiceRedirect() {
  redirect("/dashboard/finance/invoicing/new")
}
