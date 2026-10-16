-- Persist placement-test drafts and final attempts for the PostgreSQL database
-- used by the Vercel deployment. This migration neither modifies nor deletes
-- existing learner data.
CREATE TABLE "PlacementAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "readingAnswersJson" TEXT NOT NULL DEFAULT '{}',
    "listeningAnswersJson" TEXT NOT NULL DEFAULT '{}',
    "grammarAnswersJson" TEXT NOT NULL DEFAULT '{}',
    "vocabAnswersJson" TEXT NOT NULL DEFAULT '{}',
    "writingAnswer" TEXT,
    "aiWritingEvaluationJson" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlacementAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlacementAttempt_userId_version_key" ON "PlacementAttempt"("userId", "version");
CREATE INDEX "PlacementAttempt_userId_status_idx" ON "PlacementAttempt"("userId", "status");
ALTER TABLE "PlacementAttempt" ADD CONSTRAINT "PlacementAttempt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
