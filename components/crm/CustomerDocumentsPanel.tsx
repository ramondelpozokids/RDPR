"use client"

import { useState } from "react"
import { Upload, Loader2, FolderOpen } from "lucide-react"
import { formatDate } from "@/lib/utils"

type Doc = {
  id: string
  name: string
  fileUrl: string
  fileSize: number
  source: string
  createdAt: string
  folder?: { name: string } | null
}

type Folder = {
  id: string
  name: string
  _count?: { documents: number }
}

type CustomerDocumentsPanelProps = {
  customerId: string
  initialDocuments: Doc[]
  initialFolders: Folder[]
}

export function CustomerDocumentsPanel({
  customerId,
  initialDocuments,
  initialFolders,
}: CustomerDocumentsPanelProps) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [folders] = useState(initialFolders)
  const [folderId, setFolderId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("customerId", customerId)
    if (folderId) fd.append("folderId", folderId)
    try {
      const res = await fetch("/api/documents", { method: "POST", body: fd })
      const json = await res.json()
      if (res.ok && json.data) {
        setDocuments((prev) => [json.data, ...prev])
      }
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {folders.length > 0 && (
          <div>
            <label className="text-xs text-text-muted block mb-1">Carpeta</label>
            <select
              className="input text-sm py-2"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
            >
              <option value="">Sin carpeta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f._count ? `(${f._count.documents})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
        <label className="btn-secondary inline-flex cursor-pointer text-sm">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Subir documento
          <input type="file" className="hidden" onChange={onUpload} disabled={loading} />
        </label>
      </div>

      {documents.length === 0 ? (
        <div className="card text-center py-10 text-sm text-text-muted">
          <FolderOpen size={24} className="mx-auto mb-2 opacity-50" />
          Sin documentos en el expediente
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-muted">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-text-secondary">Nombre</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-text-secondary">Carpeta</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-text-secondary">Origen</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-text-secondary">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-surface-muted/50">
                  <td className="px-4 py-3">
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                      {d.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{d.folder?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-text-muted">{d.source === "PORTAL" ? "Portal" : "Interno"}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
