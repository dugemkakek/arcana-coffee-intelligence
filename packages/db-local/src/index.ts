// @arcana/db-local — main entry point.
//
// Exports the Prisma client as a singleton so multiple callers share one
// connection pool. The schema lives in ./prisma/schema.prisma.

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __arcanaPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__arcanaPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__arcanaPrisma = prisma;
}

export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';
export type { Prisma } from '@prisma/client';

export default prisma;
