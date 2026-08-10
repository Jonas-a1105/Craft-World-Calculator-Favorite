import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE_NAME = 'cc_session';
const secret = () => process.env.SESSION_SECRET || process.env.JWT_SECRET || 'replace_me';

export const SESSION_COOKIE = SESSION_COOKIE_NAME;

export function signSession(userId: string): string {
  const payload = Buffer.from(userId, 'utf-8').toString('base64url');
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const dot = cookieValue.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const expectedSig = createHmac('sha256', secret()).update(payload).digest('base64url');
  try {
    const a = Buffer.from(sig, 'base64url');
    const b = Buffer.from(expectedSig, 'base64url');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const userId = Buffer.from(payload, 'base64url').toString('utf-8');
    return userId || null;
  } catch {
    return null;
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export function sessionCookieOptions(): string {
  const flags = ['Path=/', 'HttpOnly', 'SameSite=None', 'Secure'];
  const maxAgeSeconds = Number(process.env.SESSION_MAX_AGE_SECONDS || 7 * 24 * 60 * 60);
  flags.push(`Max-Age=${maxAgeSeconds}`);
  return flags.join('; ');
}
