CREATE TABLE "GoogleAccount" (
  "subject" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GoogleAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "GoogleAccount_userId_key" ON "GoogleAccount"("userId");
CREATE TABLE "GoogleOAuthState" (
  "stateHash" TEXT NOT NULL PRIMARY KEY,
  "nonce" TEXT NOT NULL,
  "codeVerifier" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'student',
  "returnTo" TEXT NOT NULL DEFAULT '',
  "linkUserId" TEXT,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "GoogleOAuthState_expiresAt_idx" ON "GoogleOAuthState"("expiresAt");
