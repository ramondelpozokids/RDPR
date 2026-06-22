// types/index.ts
// Tipos centrales de RDPR OS

export type Role = "ADMIN" | "EMPLOYEE"

export type PipelineStage = "NEW_CONTACT" | "QUOTE_SENT" | "CLIENT_WON" | "CLIENT_LOST"

export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"

export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"

// ── Company ──────────────────────────────────
export interface Company {
  id: string
  name: string
  taxId?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  country: string
  logoUrl?: string | null
  currency: string
  taxRate: number
  createdAt: Date
  updatedAt: Date
}

// ── User ─────────────────────────────────────
export interface User {
  id: string
  name?: string | null
  email: string
  avatarUrl?: string | null
  role?: Role
  createdAt: Date
}

// ── Customer ─────────────────────────────────
export interface Customer {
  id: string
  companyId: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  taxId?: string | null
  notes?: string | null
  pipelineStage: PipelineStage
  createdAt: Date
  updatedAt: Date
}

// ── Project ──────────────────────────────────
export interface Project {
  id: string
  companyId: string
  customerId?: string | null
  name: string
  description?: string | null
  status: ProjectStatus
  startDate?: Date | null
  endDate?: Date | null
  createdAt: Date
  updatedAt: Date
  customer?: Customer | null
  tasks?: Task[]
}

// ── Task ─────────────────────────────────────
export interface Task {
  id: string
  projectId: string
  assignedTo?: string | null
  title: string
  description?: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate?: Date | null
  createdAt: Date
  updatedAt: Date
  assignee?: User | null
}

// ── Invoice ──────────────────────────────────
export interface Invoice {
  id: string
  companyId: string
  customerId: string
  number: string
  status: InvoiceStatus
  issueDate: Date
  dueDate?: Date | null
  notes?: string | null
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  paidAt?: Date | null
  createdAt: Date
  updatedAt: Date
  customer?: Customer
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

// ── Document ─────────────────────────────────
export interface Document {
  id: string
  companyId: string
  customerId?: string | null
  projectId?: string | null
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: Date
}

// ── API Response wrappers ─────────────────────
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// ── Dashboard stats ───────────────────────────
export interface DashboardStats {
  totalCustomers: number
  activeProjects: number
  pendingInvoices: number
  pendingAmount: number
  paidThisMonth: number
  newCustomersThisMonth: number
}
