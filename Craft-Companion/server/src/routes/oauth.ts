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
import { getUsers, saveUsers } from '../storage/userStorage.js';
import { signSession, sessionCookieOptions, SESSION_COOKIE } from '../auth/session.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; craftWorldUid?: string };
    }
  }
}

function getRequestOrigin(req: Request): string {
  if (process.env.CLIENT_ORIGIN) return process.env.CLIENT_ORIGIN;
  const host = req.headers.host;
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    return `${proto}://${host}`;
  }
  return 'http://localhost:5173';
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

  const pkce = generatePkcePair();
  const state = generateState();
  await createOauthSession({ state, codeVerifier: pkce.codeVerifier, clientOrigin });
  console.log('OAuth config redirectUri:', oauthConfig.redirectUri);
  console.log('OAuth config scopes:', oauthConfig.scopes);
  console.log('OAuth clientOrigin:', clientOrigin);
  const url = buildAuthorizeUrl({ state, codeChallenge: pkce.codeChallenge });
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
    tokens = await exchangeAuthorizationCode(code, session.codeVerifier);
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

  const users = await getUsers();
  const jwtUid = extractJwtUid(tokens.accessToken);
  const uid = String(profile?.uid || jwtUid || 'cw_user').trim();
  if (!uid) {
    return res.redirect(`${redirectBase}?oauth_error=${encodeURIComponent('No UID returned')}`);
  }

  let user = users.find((u) => u.craftWorldUid === uid);
  const now = new Date().toISOString();
  const expiresInMs = Number(tokens.expiresIn || 3600) * 1000;
  const tokenExpiresAt = new Date(Date.now() + expiresInMs).toISOString();

  if (!user) {
    user = { id: uid, craftWorldUid: uid, createdAt: now };
    users.push(user);
  }

  user.craftWorldUid = uid;
  user.craftWorldDisplayName = profile.displayName;
  user.craftWorldAvatarUrl = profile.avatarUrl;
  user.craftWorldLevel = profile.level;
  user.craftWorldAccessToken = tokens.accessToken;
  user.craftWorldRefreshToken = tokens.refreshToken;
  user.craftWorldTokenExpiresAt = tokenExpiresAt;
  user.craftWorldScopes = tokens.scope;
  user.lastLoginAt = now;
  await saveUsers(users);

  const maxAgeSeconds = Number(process.env.SESSION_MAX_AGE_SECONDS || 7 * 24 * 60 * 60);
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=${signSession(user.id)}; ${sessionCookieOptions()}`,
    `cc_logged_in=true; Path=/; SameSite=None; Secure; Max-Age=${maxAgeSeconds}`,
  ]);
  res.redirect(`${activeOrigin}/home`);
});

oauthRouter.post('/logout', async (req, res) => {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`));
  const token = match?.[1];

  if (token) {
    const payload = Buffer.from(token.split('.')[0], 'base64url').toString('utf-8');
    const users = await getUsers();
    const user = users.find((u) => u.id === payload);
    if (user?.craftWorldRefreshToken) {
      await revokeCraftworldToken(user.craftWorldRefreshToken);
    }
    if (user) {
      user.craftWorldAccessToken = undefined;
      user.craftWorldRefreshToken = undefined;
      user.craftWorldTokenExpiresAt = undefined;
      await saveUsers(users);
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
