-- Fase 1: Expediente gestoría — perfil, tareas, incidencias, categorías documento

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETE');
CREATE TYPE "CustomerTaskType" AS ENUM ('GENERAL', 'DOCUMENT_REQUEST', 'TAX_FILING', 'REVIEW', 'FOLLOW_UP');
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "DocumentCategory" AS ENUM ('GENERAL', 'INVOICE', 'CONTRACT', 'PAYROLL', 'TAX', 'ID_DOCUMENT', 'DEED', 'AUTHORIZATION', 'OTHER');

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "entityType" "TaxEntityType" NOT NULL DEFAULT 'AUTONOMO',
    "legalName" TEXT,
    "dniNie" TEXT,
    "cnae" TEXT,
    "fiscalAddress" TEXT,
    "fiscalCity" TEXT,
    "fiscalPostalCode" TEXT,
    "province" TEXT,
    "vatFilingPeriod" "VatFilingPeriod" NOT NULL DEFAULT 'QUARTERLY',
    "irpfRegime" "IrpfRegime",
    "socialSecurityNum" TEXT,
    "constitutionDate" TIMESTAMP(3),
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "checklist" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_tasks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CustomerTaskType" NOT NULL DEFAULT 'GENERAL',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_incidents" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_incidents_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "documents" ADD COLUMN "category" "DocumentCategory" NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "aeat_tax_filings" ADD COLUMN "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_customerId_key" ON "customer_profiles"("customerId");
CREATE INDEX "customer_tasks_companyId_customerId_status_idx" ON "customer_tasks"("companyId", "customerId", "status");
CREATE INDEX "customer_tasks_companyId_dueDate_idx" ON "customer_tasks"("companyId", "dueDate");
CREATE INDEX "customer_incidents_companyId_customerId_status_idx" ON "customer_incidents"("companyId", "customerId", "status");
CREATE INDEX "aeat_tax_filings_companyId_customerId_idx" ON "aeat_tax_filings"("companyId", "customerId");

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_tasks" ADD CONSTRAINT "customer_tasks_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_tasks" ADD CONSTRAINT "customer_tasks_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_incidents" ADD CONSTRAINT "customer_incidents_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "aeat_tax_filings" ADD CONSTRAINT "aeat_tax_filings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
