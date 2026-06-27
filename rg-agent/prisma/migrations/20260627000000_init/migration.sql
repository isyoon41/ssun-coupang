-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "businessName" TEXT,
    "defaultMarginRate" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "defaultAdBudget" INTEGER NOT NULL DEFAULT 10000,
    "defaultInboundQty" INTEGER NOT NULL DEFAULT 10,
    "preferredCategories" TEXT,
    "excludedCategories" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourcePlatform" TEXT NOT NULL DEFAULT 'manual',
    "rawProductName" TEXT,
    "rawDescription" TEXT,
    "categoryHint" TEXT,
    "categoryCandidate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "recommendationGrade" TEXT,
    "recommendationScore" DOUBLE PRECISION,
    "riskLevel" TEXT,
    "expectedMarginRate" DOUBLE PRECISION,
    "recommendedPrice" INTEGER,
    "supplyPrice" INTEGER,
    "domesticShippingCost" INTEGER,
    "imageUrls" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiOutput" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "outputType" TEXT NOT NULL,
    "title" TEXT,
    "outputJson" TEXT NOT NULL,
    "outputText" TEXT,
    "modelName" TEXT,
    "promptVersion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingOutput" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "supplyPrice" INTEGER NOT NULL DEFAULT 0,
    "domesticShippingCost" INTEGER NOT NULL DEFAULT 0,
    "overseasShippingCost" INTEGER NOT NULL DEFAULT 0,
    "customsCost" INTEGER NOT NULL DEFAULT 0,
    "packagingCost" INTEGER NOT NULL DEFAULT 0,
    "otherCost" INTEGER NOT NULL DEFAULT 0,
    "coupangFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 10.8,
    "fulfillmentFee" INTEGER NOT NULL DEFAULT 0,
    "storageFeeEstimate" INTEGER NOT NULL DEFAULT 0,
    "returnFeeEstimate" INTEGER NOT NULL DEFAULT 0,
    "adCostEstimate" INTEGER NOT NULL DEFAULT 10000,
    "targetMarginRate" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "recommendedPrice" INTEGER NOT NULL,
    "minimumPrice" INTEGER NOT NULL,
    "adSafePrice" INTEGER NOT NULL,
    "expectedProfit" INTEGER NOT NULL,
    "expectedMarginRate" DOUBLE PRECISION NOT NULL,
    "breakevenQuantity" INTEGER,
    "recommendedInboundQty" INTEGER,
    "totalInitialCost" INTEGER,
    "formulaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "checklistType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "aiOutputId" TEXT,
    "outputType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "feedback" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPackage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "packageJson" TEXT NOT NULL,
    "markdownContent" TEXT,
    "htmlContent" TEXT,
    "csvContent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ProductProject_userId_idx" ON "ProductProject"("userId");

-- CreateIndex
CREATE INDEX "ProductProject_status_idx" ON "ProductProject"("status");

-- CreateIndex
CREATE INDEX "ProductProject_riskLevel_idx" ON "ProductProject"("riskLevel");

-- CreateIndex
CREATE INDEX "AiOutput_projectId_idx" ON "AiOutput"("projectId");

-- CreateIndex
CREATE INDEX "AiOutput_agentType_idx" ON "AiOutput"("agentType");

-- CreateIndex
CREATE INDEX "AiOutput_status_idx" ON "AiOutput"("status");

-- CreateIndex
CREATE INDEX "PricingOutput_projectId_idx" ON "PricingOutput"("projectId");

-- CreateIndex
CREATE INDEX "Checklist_projectId_idx" ON "Checklist"("projectId");

-- CreateIndex
CREATE INDEX "Checklist_checklistType_idx" ON "Checklist"("checklistType");

-- CreateIndex
CREATE INDEX "Approval_projectId_idx" ON "Approval"("projectId");

-- CreateIndex
CREATE INDEX "Approval_aiOutputId_idx" ON "Approval"("aiOutputId");

-- CreateIndex
CREATE INDEX "ListingPackage_projectId_idx" ON "ListingPackage"("projectId");

-- AddForeignKey
ALTER TABLE "ProductProject" ADD CONSTRAINT "ProductProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiOutput" ADD CONSTRAINT "AiOutput_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProductProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingOutput" ADD CONSTRAINT "PricingOutput_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProductProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProductProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProductProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_aiOutputId_fkey" FOREIGN KEY ("aiOutputId") REFERENCES "AiOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPackage" ADD CONSTRAINT "ListingPackage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProductProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

