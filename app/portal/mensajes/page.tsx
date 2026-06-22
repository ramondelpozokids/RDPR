import { PortalMessagesPanel } from "@/components/portal/PortalMessagesPanel"

export default function PortalMensajesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Mensajes</h1>
        <p className="text-sm text-text-secondary">Consultas asíncronas con su asesoría (no chat en tiempo real).</p>
      </div>
      <PortalMessagesPanel />
    </div>
  )
}
