-- Additive only; existing assignments wait for teacher publication.
ALTER TABLE "Assignment" ADD COLUMN "releaseGradesImmediately" BOOLEAN NOT NULL DEFAULT false;
