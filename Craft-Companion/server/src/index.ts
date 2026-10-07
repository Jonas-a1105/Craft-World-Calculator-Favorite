import type { Server } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initPrisma, prisma } from './db/prisma.js';
import { migrateLegacyJson } from './db/migrateLegacyJson.js';

let server: Server | null = null;

async function bootstrap(): Promise<void> {
  console.log(`[Server] Booting in ${env.NODE_ENV} mode...`);
  await initPrisma();
  await migrateLegacyJson();

  server = app.listen(env.PORT, () => {
    console.log(`[Server] Running on port ${env.PORT} with SQLite Prisma`);
  });
}

async function handleShutdown(signal: string): Promise<void> {
  console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP connections closed.');
      await prisma.$disconnect();
      console.log('[Server] Database disconnected cleanly.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

bootstrap().catch((err: unknown) => {
  console.error('Fatal server bootstrap error:', err);
  process.exit(1);
});
