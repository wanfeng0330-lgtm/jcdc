-- CreateTable
CREATE TABLE "AnalysisRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "riskScore" REAL NOT NULL,
    "isAIGenerated" BOOLEAN NOT NULL,
    "riskTypes" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "sourceName" TEXT NOT NULL DEFAULT '',
    "publishedAt" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'ai_risk',
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "totalChecks" INTEGER NOT NULL DEFAULT 0,
    "riskCount" INTEGER NOT NULL DEFAULT 0,
    "avgRiskScore" REAL NOT NULL DEFAULT 0,
    "aiGeneratedCount" INTEGER NOT NULL DEFAULT 0,
    "labParticipants" INTEGER NOT NULL DEFAULT 0,
    "labAvgScore" REAL NOT NULL DEFAULT 0,
    "riskTypeDist" TEXT NOT NULL DEFAULT '{}',
    "highFreqScams" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "AnalysisRecord_createdAt_idx" ON "AnalysisRecord"("createdAt");

-- CreateIndex
CREATE INDEX "AnalysisRecord_type_idx" ON "AnalysisRecord"("type");

-- CreateIndex
CREATE INDEX "AnalysisRecord_riskLevel_idx" ON "AnalysisRecord"("riskLevel");

-- CreateIndex
CREATE INDEX "LabResult_createdAt_idx" ON "LabResult"("createdAt");

-- CreateIndex
CREATE INDEX "NewsItem_category_idx" ON "NewsItem"("category");

-- CreateIndex
CREATE INDEX "NewsItem_fetchedAt_idx" ON "NewsItem"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStat_date_key" ON "DailyStat"("date");
