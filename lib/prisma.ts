// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent creating multiple instances in development
  // (especially when using hot‑reload / Fast Refresh)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
