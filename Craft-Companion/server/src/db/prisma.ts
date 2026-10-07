import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Initializes database connection and tunes SQLite performance pragmas.
 * - WAL (Write-Ahead Logging): Allows concurrent readers and writers without locks.
 * - synchronous = NORMAL: Balances ACID safety with high throughput.
 * - foreign_keys = ON: Enforces referential integrity.
 */
export async function initPrisma(): Promise<void> {
  await prisma.$connect();
  try {
    await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
    await prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;');
    await prisma.$queryRawUnsafe('PRAGMA foreign_keys = ON;');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[DB] Notice while setting SQLite pragmas:', message);
  }
}
