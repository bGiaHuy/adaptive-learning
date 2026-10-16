-- Additive only. PostgreSQL uses the same two statements with TEXT columns.
ALTER TABLE "AssignmentVersion" ADD COLUMN "difficultyJson" TEXT;
ALTER TABLE "Submission" ADD COLUMN "abilityEvidenceJson" TEXT;
