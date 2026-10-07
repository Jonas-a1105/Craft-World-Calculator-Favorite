import { prisma } from '../db/prisma.js';
import type { User as PrismaUser } from '@prisma/client';
import type { UserAccount } from '../types.js';

function mapPrismaToUserAccount(record: PrismaUser): UserAccount {
  return {
    id: record.id,
    craftWorldUid: record.craftWorldUid ?? undefined,
    craftWorldDisplayName: record.craftWorldDisplayName ?? undefined,
    craftWorldAvatarUrl: record.craftWorldAvatarUrl ?? undefined,
    craftWorldLevel: record.craftWorldLevel ?? undefined,
    craftWorldAccessToken: record.craftWorldAccessToken ?? undefined,
    craftWorldRefreshToken: record.craftWorldRefreshToken ?? undefined,
    craftWorldTokenExpiresAt: record.craftWorldTokenExpiresAt ?? undefined,
    craftWorldScopes: record.craftWorldScopes ?? undefined,
    craftWorldClientId: record.craftWorldClientId ?? undefined,
    craftWorldClientSecret: record.craftWorldClientSecret ?? undefined,
    createdAt: record.createdAt,
    lastLoginAt: record.lastLoginAt ?? undefined,
    lastCachedHome: record.lastCachedHome ? JSON.parse(record.lastCachedHome) : undefined,
  };
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  if (!id) return null;
  const record = await prisma.user.findUnique({ where: { id } });
  return record ? mapPrismaToUserAccount(record) : null;
}

export async function getUserByCraftWorldUid(uid: string): Promise<UserAccount | null> {
  if (!uid) return null;
  const record = await prisma.user.findFirst({
    where: {
      OR: [{ craftWorldUid: uid }, { id: uid }],
    },
  });
  return record ? mapPrismaToUserAccount(record) : null;
}

export async function upsertUser(user: UserAccount): Promise<UserAccount> {
  const record = await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      craftWorldUid: user.craftWorldUid,
      craftWorldDisplayName: user.craftWorldDisplayName,
      craftWorldAvatarUrl: user.craftWorldAvatarUrl,
      craftWorldLevel: user.craftWorldLevel,
      craftWorldAccessToken: user.craftWorldAccessToken,
      craftWorldRefreshToken: user.craftWorldRefreshToken,
      craftWorldTokenExpiresAt: user.craftWorldTokenExpiresAt,
      craftWorldScopes: user.craftWorldScopes,
      craftWorldClientId: user.craftWorldClientId,
      craftWorldClientSecret: user.craftWorldClientSecret,
      lastCachedHome: user.lastCachedHome ? JSON.stringify(user.lastCachedHome) : null,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt: user.lastLoginAt,
    },
    update: {
      craftWorldUid: user.craftWorldUid,
      craftWorldDisplayName: user.craftWorldDisplayName,
      craftWorldAvatarUrl: user.craftWorldAvatarUrl,
      craftWorldLevel: user.craftWorldLevel,
      craftWorldAccessToken: user.craftWorldAccessToken,
      craftWorldRefreshToken: user.craftWorldRefreshToken,
      craftWorldTokenExpiresAt: user.craftWorldTokenExpiresAt,
      craftWorldScopes: user.craftWorldScopes,
      craftWorldClientId: user.craftWorldClientId,
      craftWorldClientSecret: user.craftWorldClientSecret,
      ...(user.lastCachedHome !== undefined
        ? { lastCachedHome: user.lastCachedHome ? JSON.stringify(user.lastCachedHome) : null }
        : {}),
      lastLoginAt: user.lastLoginAt,
    },
  });
  return mapPrismaToUserAccount(record);
}

export async function updateUserHomeCache(
  id: string,
  homePayload: Record<string, unknown> | null,
): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: {
      lastCachedHome: homePayload ? JSON.stringify(homePayload) : null,
    },
  });
}

export async function updateUserTokens(
  id: string,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt: string;
    clientId?: string;
    clientSecret?: string;
  },
): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: {
      craftWorldAccessToken: tokens.accessToken,
      ...(tokens.refreshToken ? { craftWorldRefreshToken: tokens.refreshToken } : {}),
      craftWorldTokenExpiresAt: tokens.tokenExpiresAt,
      ...(tokens.clientId ? { craftWorldClientId: tokens.clientId } : {}),
      ...(tokens.clientSecret ? { craftWorldClientSecret: tokens.clientSecret } : {}),
    },
  });
}

export async function getUsers(): Promise<UserAccount[]> {
  const records = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return records.map(mapPrismaToUserAccount);
}

export async function saveUsers(users: UserAccount[]): Promise<void> {
  await prisma.$transaction(
    users.map((u) =>
      prisma.user.upsert({
        where: { id: u.id },
        create: {
          id: u.id,
          craftWorldUid: u.craftWorldUid,
          craftWorldDisplayName: u.craftWorldDisplayName,
          craftWorldAvatarUrl: u.craftWorldAvatarUrl,
          craftWorldLevel: u.craftWorldLevel,
          craftWorldAccessToken: u.craftWorldAccessToken,
          craftWorldRefreshToken: u.craftWorldRefreshToken,
          craftWorldTokenExpiresAt: u.craftWorldTokenExpiresAt,
          craftWorldScopes: u.craftWorldScopes,
          craftWorldClientId: u.craftWorldClientId,
          craftWorldClientSecret: u.craftWorldClientSecret,
          lastCachedHome: u.lastCachedHome ? JSON.stringify(u.lastCachedHome) : null,
          createdAt: u.createdAt || new Date().toISOString(),
          lastLoginAt: u.lastLoginAt,
        },
        update: {
          craftWorldUid: u.craftWorldUid,
          craftWorldDisplayName: u.craftWorldDisplayName,
          craftWorldAvatarUrl: u.craftWorldAvatarUrl,
          craftWorldLevel: u.craftWorldLevel,
          craftWorldAccessToken: u.craftWorldAccessToken,
          craftWorldRefreshToken: u.craftWorldRefreshToken,
          craftWorldTokenExpiresAt: u.craftWorldTokenExpiresAt,
          craftWorldScopes: u.craftWorldScopes,
          craftWorldClientId: u.craftWorldClientId,
          craftWorldClientSecret: u.craftWorldClientSecret,
          ...(u.lastCachedHome !== undefined
            ? { lastCachedHome: u.lastCachedHome ? JSON.stringify(u.lastCachedHome) : null }
            : {}),
          lastLoginAt: u.lastLoginAt,
        },
      }),
    ),
  );
}
