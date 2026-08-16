import { promises as fs } from 'node:fs';
import path from 'node:path';

type OAuthSession = {
  state: string;
  codeVerifier: string;
  clientOrigin?: string;
  redirectUri?: string;
  createdAt: string;
  expiresAt: string;
};

const dataDir = process.env.DATA_DIR || './data';
const sessionsFile = path.join(dataDir, 'oauth-sessions.json');
const SESSION_TTL_MS = 10 * 60 * 1000;

async function ensureFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(sessionsFile);
  } catch {
    await fs.writeFile(sessionsFile, '[]', 'utf-8');
  }
}

async function readSessions(): Promise<OAuthSession[]> {
  await ensureFile();
  const raw = await fs.readFile(sessionsFile, 'utf-8');
  try {
    return JSON.parse(raw) as OAuthSession[];
  } catch {
    return [];
  }
}

async function writeSessions(sessions: OAuthSession[]) {
  await ensureFile();
  await fs.writeFile(sessionsFile, JSON.stringify(sessions, null, 2), 'utf-8');
}

function pruneExpired(sessions: OAuthSession[]): OAuthSession[] {
  const now = Date.now();
  return sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
}

export async function createOauthSession(data: {
  state: string;
  codeVerifier: string;
  clientOrigin?: string;
  redirectUri?: string;
}): Promise<void> {
  const now = new Date();
  const session: OAuthSession = {
    state: data.state,
    codeVerifier: data.codeVerifier,
    clientOrigin: data.clientOrigin,
    redirectUri: data.redirectUri,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  };
  const sessions = pruneExpired(await readSessions());
  sessions.push(session);
  await writeSessions(sessions);
}

export async function consumeOauthSession(state: string): Promise<OAuthSession | null> {
  const sessions = pruneExpired(await readSessions());
  const idx = sessions.findIndex((s) => s.state === state);
  if (idx === -1) return null;
  const [session] = sessions.splice(idx, 1);
  await writeSessions(sessions);
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;
  return session;
}
