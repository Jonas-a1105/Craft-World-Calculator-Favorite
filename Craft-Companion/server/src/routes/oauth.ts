import { Router, Request, Response } from 'express';
import {
  buildAuthorizeUrl,
  exchangeAuthorizationCode,
  generatePkcePair,
  generateState,
  isOAuthConfigured,
  revokeCraftworldToken,
  oauthConfig,
} from '../services/craftworldOauth.js';
import { consumeOauthSession, createOauthSession } from '../storage/oauthSessionStorage.js';
import { getExternalProfile } from '../services/craftworldExternalApi.js';
import { getUserByCraftWorldUid, getUserById, upsertUser } from '../storage/userStorage.js';
import type { UserAccount } from '../types.js';
import {
  signSession,
  sessionCookieOptions,
  loggedInCookieOptions,
  SESSION_COOKIE,
} from '../auth/session.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; craftWorldUid?: string };
    }
  }
}

function getRequestOrigin(req: Request): string {
  const host = req.headers.host;
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    return `${proto}://${host}`;
  }
  return process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
}

function getOAuthCredentials(req: Request): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const host = req.headers.host || '';
  const isHfSpace = host.includes('hf.space') || host.includes('coquerokli');
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  if (isHfSpace) {
    return {
      clientId: 'client_019f6f69-da4f-7069-b15b-bb947f5c117c',
      clientSecret: 'secret_019f6f69-da4f-7069-b15b-bb947f5c0c3e',
      redirectUri: 'https://coquerokli-craft-world-calculator-favorite.hf.space/api/auth/callback',
    };
  }

  if (!isLocal) {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    return {
      clientId:
        process.env.CRAFTWORLD_OAUTH_CLIENT_ID ||
        'client_019f6f69-da4f-7069-b15b-bb947f5c117c',
      clientSecret:
        process.env.CRAFTWORLD_OAUTH_CLIENT_SECRET ||
        'secret_019f6f69-da4f-7069-b15b-bb947f5c0c3e',
      redirectUri:
        process.env.CRAFTWORLD_OAUTH_REDIRECT_URI ||
        `${proto}://${host}/api/auth/callback`,
    };
  }

  return {
    clientId:
      process.env.CRAFTWORLD_OAUTH_CLIENT_ID ||
      'client_019f6f6c-3dbc-754a-a0ab-2fcf87a72975',
    clientSecret:
      process.env.CRAFTWORLD_OAUTH_CLIENT_SECRET ||
      'secret_019f6f6c-3dbd-7b33-9113-1838eee440ce',
    redirectUri:
      process.env.CRAFTWORLD_OAUTH_REDIRECT_URI ||
      'http://localhost:5000/api/auth/callback',
  };
}

export const oauthRouter = Router();

oauthRouter.get('/authorize', async (req, res) => {
  if (!isOAuthConfigured()) {
    return res.status(503).json({
      message: 'OAuth not configured. Set CRAFTWORLD_OAUTH_CLIENT_ID.',
    });
  }

  const referer = req.headers.referer || req.headers.origin;
  let clientOrigin = getRequestOrigin(req);
  if (typeof referer === 'string' && referer.startsWith('http')) {
    try {
      const u = new URL(referer);
      clientOrigin = `${u.protocol}//${u.host}`;
    } catch {}
  }
  if (req.query.origin && typeof req.query.origin === 'string') {
    clientOrigin = req.query.origin;
  }

  const creds = getOAuthCredentials(req);
  const pkce = generatePkcePair();
  const state = generateState();
  await createOauthSession({
    state,
    codeVerifier: pkce.codeVerifier,
    clientOrigin,
    redirectUri: creds.redirectUri,
    clientId: creds.clientId,
    clientSecret: creds.clientSecret,
  });
  console.log('OAuth config clientId:', creds.clientId);
  console.log('OAuth config redirectUri:', creds.redirectUri);
  console.log('OAuth config scopes:', oauthConfig.scopes);
  console.log('OAuth clientOrigin:', clientOrigin);
  const url = buildAuthorizeUrl({
    state,
    codeChallenge: pkce.codeChallenge,
    redirectUri: creds.redirectUri,
    clientId: creds.clientId,
  });
  console.log('Generated authorize URL:', url);
  res.redirect(url);
});

function extractJwtUid(accessToken: string): string | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return null;
    const payloadRaw = Buffer.from(parts[1], 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadRaw);
    return payload.sub || payload.uid || payload.user_id || null;
  } catch {
    return null;
  }
}

oauthRouter.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query as Record<string, string | undefined>;

  const session = state ? await consumeOauthSession(state) : null;
  const activeOrigin = session?.clientOrigin || getRequestOrigin(req);
  const redirectBase = `${activeOrigin}/signin`;

  if (error) {
    return res.redirect(
      `${redirectBase}?oauth_error=${encodeURIComponent(error_description || error)}`,
    );
  }
  if (!code || !state) {
    return res.redirect(
      `${redirectBase}?oauth_error=${encodeURIComponent('Missing code or state')}`,
    );
  }

  if (!session) {
    return res.redirect(
      `${redirectBase}?oauth_error=${encodeURIComponent('Invalid or expired session')}`,
    );
  }

  let tokens;
  try {
    tokens = await exchangeAuthorizationCode(
      code,
      session.codeVerifier,
      session.redirectUri,
      session.clientId,
      session.clientSecret,
    );
  } catch (err: any) {
    console.error('OAuth token exchange failed', err?.message);
    return res.redirect(
      `${redirectBase}?oauth_error=${encodeURIComponent(err?.message || 'Token exchange failed')}`,
    );
  }

  let profile: any = {};
  try {
    profile = await getExternalProfile(tokens.accessToken);
  } catch (err: any) {
    console.warn('OAuth profile fetch skipped or failed, using token fallback:', err?.message);
  }

  const jwtUid = extractJwtUid(tokens.accessToken);
  const uid = String(profile?.uid || jwtUid || 'cw_user').trim();
  if (!uid) {
    return res.redirect(`${redirectBase}?oauth_error=${encodeURIComponent('No UID returned')}`);
  }

  const existingUser = await getUserByCraftWorldUid(uid);
  const now = new Date().toISOString();
  const expiresInMs = Number(tokens.expiresIn || 3600) * 1000;
  const tokenExpiresAt = new Date(Date.now() + expiresInMs).toISOString();

  const userToSave: UserAccount = {
    id: existingUser?.id || uid,
    craftWorldUid: uid,
    craftWorldDisplayName: profile.displayName || existingUser?.craftWorldDisplayName,
    craftWorldAvatarUrl: profile.avatarUrl || existingUser?.craftWorldAvatarUrl,
    craftWorldLevel: profile.level || existingUser?.craftWorldLevel,
    craftWorldAccessToken: tokens.accessToken,
    craftWorldRefreshToken: tokens.refreshToken,
    craftWorldTokenExpiresAt: tokenExpiresAt,
    craftWorldScopes: tokens.scope,
    craftWorldClientId: session.clientId,
    craftWorldClientSecret: session.clientSecret,
    lastCachedHome: existingUser?.lastCachedHome,
    createdAt: existingUser?.createdAt || now,
    lastLoginAt: now,
  };

  const user = await upsertUser(userToSave);

  const signedToken = signSession(user.id);
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=${signedToken}; ${sessionCookieOptions(isSecure)}`,
    `cc_logged_in=true; ${loggedInCookieOptions(isSecure)}`,
  ]);
  res.redirect(`${activeOrigin}/home?token=${encodeURIComponent(signedToken)}`);
});

oauthRouter.post('/quick-login', async (req, res) => {
  const { uid, displayName } = req.body || {};
  const cleanUid = String(uid || 'craft_player').trim();
  const cleanName = String(displayName || cleanUid).trim();

  const existingUser = await getUserByCraftWorldUid(cleanUid);
  const now = new Date().toISOString();

  const userToSave: UserAccount = {
    id: existingUser?.id || cleanUid,
    craftWorldUid: cleanUid,
    craftWorldDisplayName: cleanName,
    craftWorldLevel: existingUser?.craftWorldLevel || 10,
    craftWorldAvatarUrl: existingUser?.craftWorldAvatarUrl,
    craftWorldAccessToken: existingUser?.craftWorldAccessToken,
    craftWorldRefreshToken: existingUser?.craftWorldRefreshToken,
    craftWorldTokenExpiresAt: existingUser?.craftWorldTokenExpiresAt,
    lastCachedHome: existingUser?.lastCachedHome,
    createdAt: existingUser?.createdAt || now,
    lastLoginAt: now,
  };

  const user = await upsertUser(userToSave);

  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=${signSession(user.id)}; ${sessionCookieOptions(isSecure)}`,
    `cc_logged_in=true; ${loggedInCookieOptions(isSecure)}`,
  ]);

  res.json({ ok: true, user });
});

oauthRouter.post('/logout', async (req, res) => {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`));
  const token = match?.[1];

  if (token) {
    const payload = Buffer.from(token.split('.')[0], 'base64url').toString('utf-8');
    const user = await getUserById(payload);
    if (user?.craftWorldRefreshToken) {
      await revokeCraftworldToken(user.craftWorldRefreshToken);
    }
    if (user) {
      user.craftWorldAccessToken = undefined;
      user.craftWorldRefreshToken = undefined;
      user.craftWorldTokenExpiresAt = undefined;
      await upsertUser(user);
    }
  }
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
    `cc_logged_in=; Path=/; Max-Age=0; SameSite=Lax`,
  ]);
  res.json({ ok: true });
});

oauthRouter.get('/status', (req, res) => {
  res.json({ configured: isOAuthConfigured(), authenticated: Boolean(req.user) });
});
