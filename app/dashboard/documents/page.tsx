// app/(dashboard)/documents/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Select, EmptyState, Modal } from "@/components/ui"
import { SearchInput }   from "@/components/ui/SearchInput"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast }         from "@/components/ui/Toaster"
import { PageSpinner }   from "@/components/ui/Spinner"
import {
  FolderOpen, Upload, FileText, File, ImageIcon,
  Trash2, ExternalLink, Pencil, X, Check, Link2,
} from "lucide-react"
import { formatDate, formatFileSize } from "@/lib/utils"

interface Doc {
  id:         string
  name:       string
  fileUrl:    string
  fileType:   string
  fileSize:   number
  createdAt:  string
  customerId: string | null
  projectId:  string | null
  customer?:  { name: string } | null
  project?:   { name: string } | null
}

function FileIcon({ type, size = 16 }: { type: string; size?: number }) {
  if (type.startsWith("image/"))       return <ImageIcon size={size} className="text-violet-500" />
  if (type === "application/pdf")      return <FileText  size={size} className="text-red-500"    />
  if (type.includes("word"))           return <FileText  size={size} className="text-brand-500"  />
  if (type.includes("sheet") || type.includes("excel"))
                                       return <FileText  size={size} className="text-emerald-500"/>
  return <File size={size} className="text-text-muted" />
}

function fileCategory(type: string) {
  if (type.startsWith("image/"))  return "Imagen"
  if (type === "application/pdf") return "PDF"
  if (type.includes("word"))      return "Word"
  if (type.includes("sheet") || type.includes("excel")) return "Excel"
  return "Archivo"
}

export default function DocumentsPage() {
  const [docs,      setDocs]      = useState<Doc[]>([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter,    setFilter]    = useState("")
  const [showPanel, setShowPanel] = useState(false)
  const [customers, setCustomers] = useState<{ value: string; label: string }[]>([])
  const [projects,  setProjects]  = useState<{ value: string; label: string }[]>([])
  const [selCustomer, setSelCustomer] = useState("")
  const [selProject,  setSelProject]  = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doc | null>(null)
  const [previewDoc,   setPreviewDoc]   = useState<Doc | null>(null)
  const [editingId,    setEditingId]    = useState<string | null>(null)
  const [editName,     setEditName]     = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/documents")
    const d   = await res.json()
    if (d.success) setDocs(d.data)
    setLoading(false)
  }

  async function loadMeta() {
    const [cr, pr] = await Promise.all([
      fetch("/api/customers").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()),
    ])
    if (cr.success) setCustomers(cr.data.map((c: any) => ({ value: c.id, label: c.name })))
    if (pr.success) setProjects(pr.data.map((p: any) => ({ value: p.id, label: p.name })))
  }

  useEffect(() => { load(); loadMeta() }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setShowPanel(true)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleUpload() {
    if (!pendingFile) return
    setUploading(true)

    const fd = new FormData()
    fd.append("file", pendingFile)
    if (selCustomer) fd.append("customerId", selCustomer)
    if (selProject)  fd.append("projectId",  selProject)

    const res = await fetch("/api/documents", { method: "POST", body: fd })
    if (res.ok) {
      toast.success("Archivo subido", pendingFile.name)
      setPendingFile(null); setShowPanel(false)
      setSelCustomer(""); setSelProject("")
      await load()
    } else {
      const d = await res.json()
      toast.error("Error al subir", d.error ?? "Inténtalo de nuevo")
    }
    setUploading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/documents/${deleteTarget.id}`, { method: "DELETE" })
    if (res.ok) {
      setDocs(prev => prev.filter(d => d.id !== deleteTarget.id))
      toast.success("Documento eliminado")
    }
    setDeleteTarget(null)
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return
    const res = await fetch(`/api/documents/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: editName.trim() }),
    })
    if (res.ok) {
      setDocs(prev => prev.map(d => d.id === id ? { ...d, name: editName.trim() } : d))
      toast.success("Nombre actualizado")
    }
    setEditingId(null)
  }

  const filtered = docs.filter(d =>
    !filter ||
    d.name.toLowerCase().includes(filter.toLowerCase()) ||
    (d.customer?.name ?? "").toLowerCase().includes(filter.toLowerCase()) ||
    (d.project?.name  ?? "").toLowerCase().includes(filter.toLowerCase())
  )

  const imgDocs = filtered.filter(d => d.fileType.startsWith("image/"))
  const otherDocs = filtered.filter(d => !d.fileType.startsWith("image/"))

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Documentos</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {docs.length} archivo{docs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
          <Button onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload size={15} />
            Subir archivo
          </Button>
        </div>
      </div>

      {/* Upload panel */}
      {showPanel && pendingFile && (
        <div className="card mb-6 border-brand-200 bg-brand-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3>Configurar subida</h3>
            <button onClick={() => { setShowPanel(false); setPendingFile(null) }} className="btn-icon">
              <X size={16} />
            </button>
          </div>
          {/* File preview */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-surface-border mb-4">
            <FileIcon type={pendingFile.type} size={24} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{pendingFile.name}</p>
              <p className="text-xs text-text-muted">
                {formatFileSize(pendingFile.size)} · {fileCategory(pendingFile.type)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Select
              label="Asociar a cliente (opcional)"
              options={customers}
              placeholder="Sin cliente"
              value={selCustomer}
              onChange={e => setSelCustomer(e.target.value)}
            />
            <Select
              label="Asociar a proyecto (opcional)"
              options={projects}
              placeholder="Sin proyecto"
              value={selProject}
              onChange={e => setSelProject(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpload} loading={uploading}>
              <Upload size={14} /> Confirmar subida
            </Button>
            <Button variant="secondary" onClick={() => { setShowPanel(false); setPendingFile(null) }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      {docs.length > 0 && (
        <div className="mb-5">
          <SearchInput
            placeholder="Buscar por nombre, cliente o proyecto..."
            value={filter}
            onChange={setFilter}
            className="max-w-xs"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <PageSpinner />
      ) : docs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<FolderOpen size={32} />}
            title="Sin documentos"
            description="Sube contratos, propuestas, imágenes y cualquier archivo relacionado con tus clientes y proyectos."
            action={
              <Button onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> Subir primer documento
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-text-muted">Sin resultados para «{filter}»</p>
          <button onClick={() => setFilter("")} className="text-xs text-brand-600 mt-2 hover:underline">
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Image gallery */}
          {imgDocs.length > 0 && (
            <div>
              <p className="section-title">Imágenes ({imgDocs.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {imgDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-surface-border bg-surface-muted cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doc.fileUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{doc.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files table */}
          {otherDocs.length > 0 && (
            <div>
              {imgDocs.length > 0 && <p className="section-title">Archivos ({otherDocs.length})</p>}
              <div className="card p-0 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-muted">
                      <th className="table-header">Archivo</th>
                      <th className="table-header hidden sm:table-cell">Tipo</th>
                      <th className="table-header hidden md:table-cell">Tamaño</th>
                      <th className="table-header hidden lg:table-cell">Asociado a</th>
                      <th className="table-header hidden xl:table-cell">Fecha</th>
                      <th className="table-header w-24">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherDocs.map(doc => (
                      <tr key={doc.id} className="table-row group">
                        <td className="table-cell">
                          <div className="flex items-center gap-2.5">
                            <FileIcon type={doc.fileType} />
                            {editingId === doc.id ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input
                                  className="input text-sm py-1 flex-1"
                                  value={editName}
                                  onChange={e => setEditName(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") handleRename(doc.id)
                                    if (e.key === "Escape") setEditingId(null)
                                  }}
                                  autoFocus
                                />
                                <button onClick={() => handleRename(doc.id)} className="text-emerald-600 hover:text-emerald-700">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => setEditingId(null)} className="text-text-muted hover:text-text-primary">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="font-medium text-text-primary truncate max-w-[180px]">
                                {doc.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="table-cell text-text-secondary hidden sm:table-cell text-xs">
                          {fileCategory(doc.fileType)}
                        </td>
                        <td className="table-cell text-text-secondary hidden md:table-cell">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="table-cell hidden lg:table-cell">
                          {(doc.customer || doc.project) ? (
                            <div className="flex items-center gap-1 text-xs text-text-secondary">
                              <Link2 size={11} className="shrink-0" />
                              <span>{doc.customer?.name ?? doc.project?.name}</span>
                            </div>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="table-cell text-text-secondary hidden xl:table-cell">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-icon"
                              title="Abrir"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => { setEditingId(doc.id); setEditName(doc.name) }}
                              className="btn-icon"
                              title="Renombrar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(doc)}
                              className="btn-icon hover:text-red-500"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-surface-border bg-surface-muted/50">
                  <p className="text-xs text-text-muted">
                    {filtered.length} de {docs.length} archivo{docs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image preview modal */}
      <Modal
        open={!!previewDoc && !!previewDoc?.fileType.startsWith("image/")}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name ?? ""}
        size="xl"
        footer={
          <>
            <a href={previewDoc?.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <ExternalLink size={14} /> Abrir original
            </a>
            <button onClick={() => setPreviewDoc(null)} className="btn-primary">Cerrar</button>
          </>
        }
      >
        {previewDoc && (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewDoc.fileUrl}
              alt={previewDoc.name}
              className="w-full max-h-[60vh] object-contain rounded-xl bg-surface-muted"
            />
            <div className="flex gap-4 text-xs text-text-secondary">
              <span>{fileCategory(previewDoc.fileType)}</span>
              <span>{formatFileSize(previewDoc.fileSize)}</span>
              <span>{formatDate(previewDoc.createdAt)}</span>
              {previewDoc.customer && <span>📎 {previewDoc.customer.name}</span>}
              {previewDoc.project  && <span>📁 {previewDoc.project.name}</span>}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar documento"
        message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirm="Eliminar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
