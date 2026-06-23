-- Tenant Firm (gestoría pagadora SaaS) + vínculo Company

CREATE TABLE "firms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "billingPlan" TEXT DEFAULT 'trial',
    "billingStatus" TEXT DEFAULT 'trialing',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "firms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "firms_slug_key" ON "firms"("slug");
ALTER TABLE "companies" ADD COLUMN "firmId" TEXT;
CREATE INDEX "companies_firmId_idx" ON "companies"("firmId");
ALTER TABLE "companies" ADD CONSTRAINT "companies_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
