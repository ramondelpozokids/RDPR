// app/(dashboard)/invoices/[id]/pdf/page.tsx
// This page just redirects to the API route that generates the HTML PDF
import { redirect } from "next/navigation"

export default function InvoicePDFPage({ params }: { params: { id: string } }) {
  redirect(`/api/invoices/${params.id}/pdf`)
}
