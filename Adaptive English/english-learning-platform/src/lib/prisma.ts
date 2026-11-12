import { PrismaClient } from '@prisma/client';
import { cloudflarePrisma } from './cloudflarePrisma';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (process.env.CLOUDFLARE_DATA_URL ? cloudflarePrisma() : new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  }));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
