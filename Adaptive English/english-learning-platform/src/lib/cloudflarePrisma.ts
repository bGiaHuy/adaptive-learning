import type { PrismaClient } from '@prisma/client';

export function cloudflarePrisma(): PrismaClient {
  // The normal Prisma client remains unchanged for local SQLite/PostgreSQL use.
  // This separately generated client always targets the disposable SQLite planner.
  const { PrismaClient: SQLiteClient } = require('../generated/cloudflarePrisma');
  const { createCloudflareStore } = require('./cloudflareStore.cjs');
  return createCloudflareStore({ PrismaClient: SQLiteClient }) as PrismaClient;
}
