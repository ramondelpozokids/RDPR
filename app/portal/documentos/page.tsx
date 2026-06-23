"use client"

import { useEffect, useState } from "react"
import { Upload, Loader2, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"

type Doc = {
  id: string
  name: string
  fileUrl: string
  createdAt: string
  folder?: { name: string } | null
}

type Folder = { id: string; name: string }

export default function PortalDocumentosPage() {
  const [documents, setDocuments] = useState<Doc[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [folderId, setFolderId] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  async function load() {
    const res = await fetch("/api/portal/documents")
    const json = await res.json()
    if (json.data?.documents) setDocuments(json.data.documents)
    if (json.data?.folders) setFolders(json.data.folders)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    if (folderId) fd.append("folderId", folderId)
    try {
      const res = await fetch("/api/portal/documents", { method: "POST", body: fd })
      if (res.ok) await load()
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Mis documentos</h1>
        <p className="text-sm text-text-secondary">Descargue o suba documentación para su asesoría.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {folders.length > 0 && (
          <div>
            <label className="text-xs text-text-muted block mb-1">Carpeta</label>
            <select className="input text-sm py-2" value={folderId} onChange={(e) => setFolderId(e.target.value)}>
              <option value="">Sin carpeta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}
        <label className="btn-primary inline-flex cursor-pointer text-sm">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Subir documento
          <input type="file" className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : documents.length === 0 ? (
        <div className="card text-center py-12 text-text-muted text-sm">
          <FileText size={28} className="mx-auto mb-2 opacity-40" />
          Aún no hay documentos en su expediente.
        </div>
      ) : (
        <ul className="card divide-y divide-surface-border p-0">
          {documents.map((d) => (
            <li key={d.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:underline truncate block">
                  {d.name}
                </a>
                <p className="text-xs text-text-muted">{formatDate(d.createdAt)}</p>
              </div>
              {d.folder?.name && (
                <span className="text-xs text-text-muted shrink-0">{d.folder.name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
