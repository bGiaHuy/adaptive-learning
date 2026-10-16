-- PostgreSQL production migration; must be applied before deploying this feature.
CREATE TABLE "AssignmentAttachment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "assignmentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE
);
CREATE INDEX "AssignmentAttachment_assignmentId_version_idx" ON "AssignmentAttachment"("assignmentId", "version");
