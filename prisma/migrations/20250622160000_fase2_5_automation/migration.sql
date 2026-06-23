-- Fase 2-5: autorizaciones, OCR jobs, borradores gasto, banca cliente

CREATE TYPE "AuthorizationScope" AS ENUM ('AEAT_PRESENT', 'SS_MANAGE', 'BANK_READ', 'FULL_REPRESENTATION');
CREATE TYPE "GrantStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');
CREATE TYPE "OcrJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "ExpenseDraftStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE "BankConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'EXPIRED', 'REVOKED');

CREATE TABLE "authorization_grants" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "signatureRequestId" TEXT,
    "scopes" "AuthorizationScope"[] DEFAULT ARRAY[]::"AuthorizationScope"[],
    "status" "GrantStatus" NOT NULL DEFAULT 'PENDING',
    "grantedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "authorization_grants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ocr_jobs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "documentId" TEXT NOT NULL,
    "status" "OcrJobStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ocr_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expense_drafts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "documentId" TEXT NOT NULL,
    "vendor" TEXT,
    "description" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 21,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'SERVICES',
    "confidence" TEXT NOT NULL DEFAULT 'low',
    "status" "ExpenseDraftStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewedAt" TIMESTAMP(3),
    "expenseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "expense_drafts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_bank_connections" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "iban" TEXT,
    "bankName" TEXT,
    "status" "BankConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "consentExpiresAt" TIMESTAMP(3),
    "externalId" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customer_bank_connections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "authorization_grants_signatureRequestId_key" ON "authorization_grants"("signatureRequestId");
CREATE INDEX "authorization_grants_companyId_customerId_idx" ON "authorization_grants"("companyId", "customerId");
CREATE UNIQUE INDEX "ocr_jobs_documentId_key" ON "ocr_jobs"("documentId");
CREATE INDEX "ocr_jobs_companyId_status_idx" ON "ocr_jobs"("companyId", "status");
CREATE UNIQUE INDEX "expense_drafts_documentId_key" ON "expense_drafts"("documentId");
CREATE INDEX "expense_drafts_companyId_status_idx" ON "expense_drafts"("companyId", "status");
CREATE INDEX "customer_bank_connections_companyId_customerId_idx" ON "customer_bank_connections"("companyId", "customerId");

ALTER TABLE "authorization_grants" ADD CONSTRAINT "authorization_grants_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "authorization_grants" ADD CONSTRAINT "authorization_grants_signatureRequestId_fkey" FOREIGN KEY ("signatureRequestId") REFERENCES "signature_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ocr_jobs" ADD CONSTRAINT "ocr_jobs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expense_drafts" ADD CONSTRAINT "expense_drafts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "expense_drafts" ADD CONSTRAINT "expense_drafts_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_bank_connections" ADD CONSTRAINT "customer_bank_connections_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
