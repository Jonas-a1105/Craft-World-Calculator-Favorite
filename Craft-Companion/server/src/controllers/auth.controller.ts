import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
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
import type { UserAccount, CraftworldExternalProfile } from '../types.js';
import { getErrorMessage } from '../types.js';
import {
  signSession,
  sessionCookieOptions,
  loggedInCookieOptions,
  SESSION_COOKIE,
} from '../auth/session.js';
import type { QuickLoginInput } from '../schemas/auth.schema.js';

function getRequestOrigin(req: Request): string {
  const host = req.headers.host;
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    return `${proto}://${host}`;
  }
  return env.CLIENT_ORIGIN || env.FRONTEND_URL || 'http://localhost:5173';
}

function getOAuthCredentials(req: Request): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const host = req.headers.host || '';
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  const redirectUri = env.CRAFTWORLD_OAUTH_REDIRECT_URI ||
    (isLocal
      ? `http://localhost:${env.PORT}/api/auth/callback`
      : `${proto}://${host}/api/auth/callback`);

  return {
    clientId: env.CRAFTWORLD_OAUTH_CLIENT_ID || oauthConfig.clientId,
    clientSecret: env.CRAFTWORLD_OAUTH_CLIENT_SECRET || oauthConfig.clientSecret,
    redirectUri,
  };
}

function extractJwtUid(accessToken: string): string | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return null;
    const payloadRaw = Buffer.from(parts[1], 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
    return (payload.sub || payload.uid || payload.user_id || null) as string | null;
  } catch {
    return null;
  }
}

export async function authorize(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!isOAuthConfigured()) {
      res.status(503).json({
        message: 'OAuth not configured. Set CRAFTWORLD_OAUTH_CLIENT_ID.',
      });
      return;
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

    const url = buildAuthorizeUrl({
      state,
      codeChallenge: pkce.codeChallenge,
      redirectUri: creds.redirectUri,
      clientId: creds.clientId,
    });

    res.redirect(url);
  } catch (error) {
    next(error);
  }
}

export async function handleCallback(req: Request, res: Response): Promise<void> {
  const { code, state, error, error_description } = req.query as Record<string, string | undefined>;

  const session = state ? await consumeOauthSession(state) : null;
  const activeOrigin = session?.clientOrigin || getRequestOrigin(req);
  const redirectBase = `${activeOrigin}/signin`;

  if (error) {
    res.redirect(
      `${redirectBase}?oauth_error=${encodeURIComponent(error_description || error)}`,
    );
    return;
  }
  if (!code || !state) {
    res.redirect(
      `${redirectBase}?oauth_error=${encodeURIComponent('Missing code or state')}`,
    );
    return;
  }

  if (!session) {
    res.redirect(
      `${redirectBase}?oauth_error=${encodeURIComponent('Invalid or expired session')}`,
    );
    return;
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
  } catch (err: unknown) {
    const errorMsg = getErrorMessage(err);
    console.error('OAuth token exchange failed:', errorMsg);
    res.redirect(
      `${redirectBase}?oauth_error=${encodeURIComponent(errorMsg || 'Token exchange failed')}`,
    );
    return;
  }

  let profile: Partial<CraftworldExternalProfile> = {};
  try {
    profile = await getExternalProfile(tokens.accessToken);
  } catch (err: unknown) {
    console.warn('OAuth profile fetch skipped or failed, using token fallback:', getErrorMessage(err));
  }

  const jwtUid = extractJwtUid(tokens.accessToken);
  const uid = String(profile?.uid || jwtUid || 'cw_user').trim();
  if (!uid) {
    res.redirect(`${redirectBase}?oauth_error=${encodeURIComponent('No UID returned')}`);
    return;
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
  res.redirect(`${activeOrigin}/splash?to=/home&token=${encodeURIComponent(signedToken)}`);
}

export async function quickLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { uid, displayName } = (req.body || {}) as QuickLoginInput;
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
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
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
  } catch (error) {
    next(error);
  }
}

export function getAuthStatus(req: Request, res: Response): void {
  res.json({ configured: isOAuthConfigured(), authenticated: Boolean(req.user) });
}
