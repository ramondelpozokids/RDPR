# Roadmap técnico RDPR OS — Gestoría + ERP + IA

> **Horizonte:** Q3 2026 → Q2 2027  
> **Objetivo:** Competir en el combo **Finance + Tax + Payroll + Legal + Documents + AI** — integración nativa que pocas plataformas ofrecen juntas.  
> **Fuente de verdad producto:** `lib/site/gestoria-vision.ts` · **Modelos AEAT:** `lib/tax/models-registry.ts`

---

## Estado actual (baseline — junio 2026)

| Área | Estado | En código |
|------|--------|-----------|
| **Contabilidad** | Operativo | `ChartOfAccount`, `JournalEntry`, PGC, informes |
| **Facturación / eFactura** | Operativo | `Invoice`, Facturae, PDF, Verifactu (electronic) |
| **Tax Intelligence** | Parcial v1 | 303, 390, 111, 130, 190, 200, 347 — cálculo + export CSV |
| **Banca / conciliación** | Operativo | `BankAccount`, `BankTransaction`, match |
| **CRM** | Operativo | `Customer`, embudo, actividad |
| **Proyectos** | Operativo | `Project`, `Task`, fases |
| **Documentos (interno)** | Beta | `Document`, upload dashboard |
| **Portal cliente** | Beta | `SecureUpload`, `/enviar-documentos` |
| **IA** | Operativo | `/api/intelligence/ask` |
| **Contacto marketing** | Operativo | `ContactInquiry` |
| **Laboral / nóminas** | No existe | — |
| **Jurídico** | No existe | Marca `RDPR Legal` en catálogo solamente |
| **Firma electrónica** | No existe | — |
| **Compliance RGPD** | Legal estático | Páginas legales, sin módulo operativo |
| **Mercantil** | No existe | — |
| **Presentación AEAT** | Roadmap | `TAX_INTELLIGENCE_ROADMAP` en registry |

**Modelos AEAT pendientes de implementar:** 131, 115, 180, 202, 349.

---

## Principios de priorización

1. **Cliente primero:** portal + documentos + fiscal visible = retención de asesoría.
2. **Un solo tenant (`companyId`):** todo nuevo schema cuelga de `Company` (patrón existente).
3. **IA sobre datos reales:** cada módulo nuevo debe ser consultable por RDPR Intelligence.
4. **No prometer en marketing lo que no está en `STATUS_LABELS`:** live / beta / planned.

---

## Q3 2026 — Consolidar núcleo gestoría (Finance + Tax + Documents + Portal)

**Meta:** Una gestoría puede operar el día a día sin Excel externo para fiscal y documentación.

### Entregables producto

- [ ] Completar modelos AEAT **202** (pagos fraccionados IS) y **349** (intracomunitario) — al menos cálculo orientativo v1.
- [ ] **RDPR Documents v1:** carpetas por cliente/expediente, etiquetas, búsqueda por nombre/fecha.
- [ ] **RDPR Portal v1:** login cliente (rol `CLIENT`), ver/descargar documentos propios, subir facturas, estado de modelos fiscales (solo lectura).
- [ ] **Expediente 360° en CRM:** pestañas fiscal · documentos · tareas · incidencias en `Customer`.
- [ ] Stripe / cobro online (post-constitución SL) — planes Starter → Enterprise.
- [ ] Verifactu en producción (si normativa lo exige en ventana).

### Schema Prisma (nuevo / ampliado)

```prisma
// Portal cliente
enum UserRole { ADMIN ADVISOR CLIENT }  // ampliar User / UserCompany

model ClientPortalAccess {
  id         String   @id @default(cuid())
  userId     String
  companyId  String   // empresa del cliente (tenant asesoría)
  customerId String   // expediente CRM vinculado
  @@unique([userId, customerId])
}

model DocumentFolder {
  id         String @id @default(cuid())
  companyId  String
  customerId String?
  name       String
  parentId   String?
}

// Ampliar Document
// + folderId, customerId, tags[], source (portal|internal|upload)
```

### APIs

| Ruta | Descripción |
|------|-------------|
| `GET/POST /api/portal/documents` | Listado y subida cliente |
| `GET /api/portal/tax-summary` | Resumen modelos del trimestre (solo lectura) |
| `POST /api/documents/folders` | CRUD carpetas interno |
| Ampliar `/api/tax/export` | Modelos 202, 349 |

### UI

| Ruta | Descripción |
|------|-------------|
| `/portal` | Layout cliente (sin sidebar asesoría) |
| `/portal/documentos` | Biblioteca cliente |
| `/portal/impuestos` | Resumen fiscal |
| `/dashboard/crm/[id]` | Tabs expediente 360° |

### Dependencias

- Auth: rol `CLIENT` + middleware que limite `companyId`/`customerId`.
- `SecureUpload` → migrar a flujo autenticado portal (mantener anónimo opcional).

### KPIs

- % clientes con acceso portal activo.
- Documentos vinculados a expediente CRM.
- Modelos v1 exportados por trimestre.

---

## Q4 2026 — Payroll MVP + Legal foundation

**Meta:** Primer módulo laboral usable + base jurídica documental.

### Entregables producto

- [ ] **RDPR Payroll MVP:** empleados, contratos, altas/bajas (datos maestros), nómina manual/import CSV, recibo PDF.
- [ ] Modelos **115 / 180** (retenciones alquiler) — cálculo v1 si hay datos de arrendamiento en gastos.
- [ ] **RDPR Legal v0:** repositorio de contratos/plantillas, vinculados a `Customer` y `Document`.
- [ ] IA: preguntas laborales básicas (*vacaciones pendientes*, *coste nómina mes*).
- [ ] Notificaciones email (vencimientos fiscales, documento subido en portal).

### Schema Prisma

```prisma
model Employee {
  id          String @id @default(cuid())
  companyId   String
  customerId  String?  // si el empleado es de un cliente gestionado
  firstName   String
  lastName    String
  nif         String
  contractType String
  startDate   DateTime
  endDate     DateTime?
  baseSalary  Float
  @@map("employees")
}

model PayrollRun {
  id        String @id @default(cuid())
  companyId String
  period    String  // 2026-06
  status    PayrollStatus
  lines     PayrollLine[]
}

model PayrollLine {
  id           String @id @default(cuid())
  payrollRunId String
  employeeId   String
  gross        Float
  deductions   Float
  net          Float
}

model LegalTemplate {
  id        String @id @default(cuid())
  companyId String
  title     String
  category  String  // contrato, acta, reclamacion
  body      String  @db.Text
}

model LegalCase {
  id         String @id @default(cuid())
  companyId  String
  customerId String?
  title      String
  status     String
  documents  Document[]  // relación
}
```

### APIs

| Ruta | Descripción |
|------|-------------|
| `/api/payroll/employees` | CRUD empleados |
| `/api/payroll/runs` | Generación nómina periodo |
| `/api/payroll/runs/[id]/pdf` | Recibos |
| `/api/legal/templates` | Plantillas |
| `/api/legal/cases` | Expedientes jurídicos |

### UI

| Ruta | Descripción |
|------|-------------|
| `/dashboard/payroll` | Resumen laboral |
| `/dashboard/payroll/employees` | Plantilla |
| `/dashboard/payroll/runs` | Nóminas |
| `/dashboard/legal` | Casos y plantillas |

### Dependencias

- Q3 Portal + Documents (recibos nómina en portal cliente).
- Definir si Payroll es por `companyId` del cliente final o de la gestoría (recomendado: **por empresa cliente** = mismo `Company` multi-empresa ya existente).

### KPIs

- Empleados dados de alta en sistema.
- Nóminas generadas / mes.
- Contratos jurídicos archivados con versión.

---

## Q1 2027 — Signature + Compliance + IA documental

**Meta:** Firma, RGPD operativo y OCR/IA sobre documentos.

### Entregables producto

- [ ] **RDPR Signature:** integración proveedor (Signaturit / DocuSign / Autofirma) — flujo solicitar firma desde Legal/Portal.
- [ ] **RDPR Compliance:** registro de actividades de tratamiento, consentimientos, exportación RGPD por cliente.
- [ ] **OCR + clasificación IA:** facturas/recibos subidos → borrador gasto / asiento sugerido.
- [ ] Modelos **131** (módulos IRPF) si perfil fiscal `OBJECTIVE_MODULES`.
- [ ] Chat portal: mensajes asesoría ↔ cliente (async, no WhatsApp).

### Schema Prisma

```prisma
model SignatureRequest {
  id         String @id @default(cuid())
  companyId  String
  documentId String
  status     SignatureStatus
  externalId String?  // ID proveedor firma
  signedAt   DateTime?
}

model DataProcessingRecord {
  id          String @id @default(cuid())
  companyId   String
  activity    String
  purpose     String
  legalBasis  String
  retention   String
}

model PortalMessage {
  id         String @id @default(cuid())
  companyId  String
  customerId String
  authorId   String
  body       String @db.Text
  readAt     DateTime?
}

model DocumentOcrResult {
  id         String @id @default(cuid())
  documentId String @unique
  rawText    String @db.Text
  structured Json?   // vendor, amount, date, vat
}
```

### APIs

| Ruta | Descripción |
|------|-------------|
| `POST /api/signatures/request` | Iniciar firma |
| `POST /api/signatures/webhook` | Callback proveedor |
| `/api/compliance/processing-records` | CRUD RGPD |
| `POST /api/documents/[id]/ocr` | Encolar OCR |
| `/api/portal/messages` | Chat cliente |

### Dependencias

- Q4 Legal + Payroll (contratos laborales firmables).
- Cola de jobs (Vercel cron / Inngest / BullMQ) para OCR.

### KPIs

- Documentos firmados / mes.
- % facturas portal auto-clasificadas.
- Tiempo medio respuesta portal.

---

## Q2 2027 — Mercantil + AEAT avanzado + Cash forecasting

**Meta:** Cerrar el círculo asesoría premium e integraciones administración.

### Entregables producto

- [ ] **Área mercantil v1:** actas, libros societarios (plantillas + checklist), calendario obligaciones mercantiles.
- [ ] **Presentación AEAT** (certificado digital) — integración SII/AEAT según viabilidad legal.
- [ ] **Cash flow / forecasting** en Banking (12 meses, escenarios).
- [ ] **Centros de coste + analítica** contable básica.
- [ ] **Cierre contable** asistido (asientos regularización, bloqueo periodo).
- [ ] Ampliar Intelligence: *margen anual*, *gastos deducibles*, simulaciones fiscales.

### Schema Prisma

```prisma
model CorporateAction {
  id          String @id @default(cuid())
  companyId   String
  type        String  // constitution, capital_increase, administrator_change
  status      String
  dueDate     DateTime?
  documents   Document[]
}

model AccountingPeriod {
  id        String @id @default(cuid())
  companyId String
  year      Int
  month     Int?
  closedAt  DateTime?
  locked    Boolean @default(false)
}

model CostCenter {
  id        String @id @default(cuid())
  companyId String
  code      String
  name      String
}
```

### Dependencias

- Q1 Signature (actas firmadas).
- Q3 Tax export completo.

---

## Matriz de dependencias (resumen)

```
Company + Auth (existente)
    ├── Finance / Accounting ──┬── Tax Intelligence
    │                          └── Banking → Forecasting (Q2'27)
    ├── CRM / Customer ────────┬── Portal (Q3'26)
    │                          ├── Documents (Q3'26)
    │                          └── Expediente 360° (Q3'26)
    ├── Documents ─────────────┬── OCR / IA (Q1'27)
    │                          └── Signature (Q1'27)
    ├── Payroll (Q4'26) ─────── Portal nóminas
    ├── Legal (Q4'26) ───────── Signature + Compliance (Q1'27)
    └── Intelligence ────────── consume todos los módulos
```

---

## Stack recomendado por capa (sin cambiar lo existente)

| Capa | Actual | Añadir |
|------|--------|--------|
| Frontend | Next.js 14, Tailwind | Portal layout, componentes firma |
| API | Route handlers | Webhooks firma, cola OCR |
| DB | PostgreSQL + Prisma | Migraciones por trimestre |
| Auth | NextAuth v5 | Rol `CLIENT`, invitaciones portal |
| Storage | R2/S3 (documentos) | Versionado, antivirus opcional |
| IA | Intelligence ask | RAG documental, tools payroll/legal |
| Firma | — | Signaturit o equivalente ES |
| Email | — | Resend / Postmark (vencimientos) |
| Pagos | Stripe (pendiente SL) | Planes marketing |

---

## Riesgos y decisiones abiertas

| Tema | Opciones | Recomendación |
|------|----------|---------------|
| Nóminas | Build vs integrar (A3 laboral API) | MVP manual + CSV; integrar RED en Q2'27 |
| Firma | Signaturit vs Autofirma @firma | Signaturit para SaaS; Autofirma para sector público |
| AEAT presentación | Certificado en servidor vs desktop | Fase 1: export; Fase 2: presentación asistida |
| Legal profundo | RDPR Legal vs CourtManager Pro | CourtManager para vertical deportivo; RDPR Legal para contratos/RGPD gestoría |
| Multi-empresa cliente | Un login, N empresas | Reutilizar `Company` + `UserCompany` existente |

---

## Cómo mantener alineado marketing ↔ código

1. Actualizar `status` en `RDPR_PRODUCT_MODULES` (`gestoria-vision.ts`) al cerrar cada hito.
2. Modelos AEAT: `status` + `v1` en `models-registry.ts`.
3. No publicar en web funciones sin badge **Disponible** o **En desarrollo**.
4. Revisar este roadmap al inicio de cada trimestre.

---

## Próxima acción inmediata (sprint 1 — 2 semanas)

1. Rol `CLIENT` + invitación desde CRM.
2. `DocumentFolder` + vínculo `Document.customerId`.
3. Layout `/portal` con listado documentos.
4. Modelo **202** en Tax Intelligence (estimación pagos fraccionados IS).
5. Tabs expediente en `/dashboard/crm/[id]`.

---

*Documento generado para RDPR Digital S.L. — revisión trimestral.*
