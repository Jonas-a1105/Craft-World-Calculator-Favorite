import { promises as fs } from 'node:fs';
import path from 'node:path';
import { prisma } from './prisma.js';

const dataDir = process.env.DATA_DIR || './data';

export async function migrateLegacyJson(): Promise<void> {
  const usersFile = path.join(dataDir, 'users.json');

  // 1. Migrate users.json
  try {
    await fs.access(usersFile);
    const raw = await fs.readFile(usersFile, 'utf-8');
    const users = JSON.parse(raw || '[]');

    if (Array.isArray(users) && users.length > 0) {
      console.log(`[DB Migration] Found ${users.length} legacy users in users.json. Migrating to SQLite...`);
      for (const u of users) {
        if (!u.id) continue;
        const existing = await prisma.user.findUnique({ where: { id: u.id } });
        if (!existing) {
          await prisma.user.create({
            data: {
              id: u.id,
              craftWorldUid: u.craftWorldUid || null,
              craftWorldDisplayName: u.craftWorldDisplayName || null,
              craftWorldAvatarUrl: u.craftWorldAvatarUrl || null,
              craftWorldLevel: typeof u.craftWorldLevel === 'number' ? u.craftWorldLevel : null,
              craftWorldAccessToken: u.craftWorldAccessToken || null,
              craftWorldRefreshToken: u.craftWorldRefreshToken || null,
              craftWorldTokenExpiresAt: u.craftWorldTokenExpiresAt || null,
              craftWorldScopes: u.craftWorldScopes || null,
              craftWorldClientId: u.craftWorldClientId || null,
              craftWorldClientSecret: u.craftWorldClientSecret || null,
              lastCachedHome: u.lastCachedHome ? JSON.stringify(u.lastCachedHome) : null,
              createdAt: u.createdAt || new Date().toISOString(),
              lastLoginAt: u.lastLoginAt || null,
            },
          });
          console.log(`[DB Migration] Migrated user: ${u.id} (${u.craftWorldDisplayName || 'Player'})`);
        }
      }
      // Keep a backup of the original users.json and rename
      const backupFile = path.join(dataDir, `users.json.migrated.${Date.now()}.bak`);
      await fs.copyFile(usersFile, backupFile);
      console.log(`[DB Migration] Legacy users backed up to ${backupFile}`);
    }
  } catch (err: any) {
    if (err?.code !== 'ENOENT') {
      console.warn('[DB Migration] Notice during users.json migration:', err?.message);
    }
  }

  // 2. Migrate matrix-cache.json if present
  const matrixFile = path.join(dataDir, 'matrix-cache.json');
  try {
    await fs.access(matrixFile);
    const rawMatrix = await fs.readFile(matrixFile, 'utf-8');
    const matrixData = JSON.parse(rawMatrix || '{}');
    if (matrixData && typeof matrixData === 'object') {
      const existing = await prisma.matrixCache.findUnique({ where: { id: 'default' } });
      if (!existing) {
        await prisma.matrixCache.create({
          data: {
            id: 'default',
            selectedGroup: matrixData.selectedGroup || null,
            scanStatus: matrixData.scanStatus || 'idle',
            scanColumn: matrixData.scanColumn || null,
            scanStartedAt: matrixData.scanStartedAt || null,
            nextScanAt: matrixData.nextScanAt || null,
            cells: JSON.stringify(matrixData.cells || {}),
            updatedAt: matrixData.updatedAt || new Date().toISOString(),
          },
        });
        console.log('[DB Migration] Migrated legacy matrix-cache.json to SQLite');
      }
    }
  } catch (err: any) {
    if (err?.code !== 'ENOENT') {
      console.warn('[DB Migration] Notice during matrix cache migration:', err?.message);
    }
  }

  // 3. Clean up stale leftover .tmp files
  try {
    const files = await fs.readdir(dataDir);
    for (const f of files) {
      if (f.endsWith('.tmp')) {
        const fullPath = path.join(dataDir, f);
        await fs.unlink(fullPath).catch(() => {});
        console.log(`[DB Migration] Cleaned up legacy leftover tmp file: ${f}`);
      }
    }
  } catch {}
}
