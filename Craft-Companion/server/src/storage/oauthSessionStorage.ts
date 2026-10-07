import { prisma } from '../db/prisma.js';

export type OAuthSession = {
  state: string;
  codeVerifier: string;
  clientOrigin?: string;
  redirectUri?: string;
  clientId?: string;
  clientSecret?: string;
  createdAt: string;
  expiresAt: string;
};

const SESSION_TTL_MS = 10 * 60 * 1000;

export async function createOauthSession(data: {
  state: string;
  codeVerifier: string;
  clientOrigin?: string;
  redirectUri?: string;
  clientId?: string;
  clientSecret?: string;
}): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  // Prune expired sessions in the background
  prisma.oAuthSession
    .deleteMany({
      where: {
        expiresAt: { lt: now.toISOString() },
      },
    })
    .catch(() => {});

  await prisma.oAuthSession.upsert({
    where: { state: data.state },
    create: {
      state: data.state,
      codeVerifier: data.codeVerifier,
      clientOrigin: data.clientOrigin || null,
      redirectUri: data.redirectUri || null,
      clientId: data.clientId || null,
      clientSecret: data.clientSecret || null,
      createdAt: now.toISOString(),
      expiresAt,
    },
    update: {
      codeVerifier: data.codeVerifier,
      clientOrigin: data.clientOrigin || null,
      redirectUri: data.redirectUri || null,
      clientId: data.clientId || null,
      clientSecret: data.clientSecret || null,
      expiresAt,
    },
  });
}

export async function consumeOauthSession(state: string): Promise<OAuthSession | null> {
  if (!state) return null;

  try {
    const record = await prisma.oAuthSession.findUnique({
      where: { state },
    });

    if (!record) return null;

    // Atomic one-time consume
    await prisma.oAuthSession.delete({
      where: { state },
    }).catch(() => {});

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return null;
    }

    return {
      state: record.state,
      codeVerifier: record.codeVerifier,
      clientOrigin: record.clientOrigin ?? undefined,
      redirectUri: record.redirectUri ?? undefined,
      clientId: record.clientId ?? undefined,
      clientSecret: record.clientSecret ?? undefined,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
    };
  } catch {
    return null;
  }
}
