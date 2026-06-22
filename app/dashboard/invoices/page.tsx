import { redirect } from "next/navigation"

export default function LegacyInvoicesRedirect() {
  redirect("/dashboard/finance/invoicing")
}
