CREATE TABLE IF NOT EXISTS "LessonAttempt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "lessonTitle" TEXT NOT NULL,
  "skill" TEXT NOT NULL,
  "score" DOUBLE PRECISION,
  "total" INTEGER NOT NULL,
  "percentage" DOUBLE PRECISION,
  "independentRate" INTEGER NOT NULL DEFAULT 0,
  "assessmentStatus" TEXT NOT NULL DEFAULT 'scored',
  "completedAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LessonAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LessonAttempt_userId_skill_completedAt_idx" ON "LessonAttempt"("userId", "skill", "completedAt");
