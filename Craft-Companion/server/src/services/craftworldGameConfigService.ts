import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

/**
 * Proxy con caché de la configuración estática oficial de Craft World y del
 * estado de la masterpiece en curso, sirviendo la query GraphQL que el equipo
 * del juego compartió (POST https://craft-world.gg/graphql).
 *
 * - La config apenas cambia: se consulta primero un checksum ligero y solo se
 *   descarga el payload completo (~3,6 MB) si cambió (o cada TTL como máximo).
 * - Persistencia en disco para no golpear la API en cada arranque.
 */

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const QUERY_PATH = path.resolve(
  MODULE_DIR,
  '../../../shared/gameConfig/aggregatedCraftWorldConfiguration.graphql',
);
const MASTERPIECE_QUERY_PATH = path.resolve(
  MODULE_DIR,
  '../../../shared/gameConfig/currentMasterpiece.graphql',
);

const GRAPHQL_URL = env.CRAFTWORLD_GRAPHQL_URL;
const CONFIG_TTL_MS = 6 * 60 * 60 * 1000;
const MASTERPIECE_TTL_MS = 60 * 1000;
const FETCH_TIMEOUT_MS = 20000;

const CACHE_FILE = path.join(env.DATA_DIR, 'gameConfigCache.json');

/** SSRF guard: solo https y solo el dominio oficial del juego. */
function assertAllowedGraphqlUrl(rawUrl: string): URL {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:') throw new Error(`Protocolo no permitido: ${url.protocol}`);
  const host = url.hostname.toLowerCase();
  if (host !== 'craft-world.gg' && host !== 'www.craft-world.gg') {
    throw new Error(`Host GraphQL no permitido: ${host}`);
  }
  return url;
}

async function postGraphql<T>(body: Record<string, unknown>): Promise<T> {
  const url = assertAllowedGraphqlUrl(GRAPHQL_URL);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const parsed = (await res.json()) as { data?: T; errors?: Array<{ message?: string }> };
  if (parsed.errors?.length) {
    throw new Error(`GraphQL: ${parsed.errors[0]?.message || 'query error'}`);
  }
  if (!parsed.data) throw new Error('GraphQL: respuesta sin data');
  return parsed.data;
}

export interface GameConfigSnapshot {
  meta: { checksum: string; builtAt: string; source: string };
  data: Record<string, unknown> & { checksum?: string };
}

let memoryCache: { snapshot: GameConfigSnapshot; fetchedAt: number } | null = null;
let masterpieceCache = new Map<string, { data: unknown; fetchedAt: number }>();

function isValidConfigData(data: unknown): data is GameConfigSnapshot['data'] {
  const d = data as GameConfigSnapshot['data'];
  return Boolean(
    d &&
      Array.isArray((d as { factoryDefinitions?: unknown }).factoryDefinitions) &&
      (d as { workshopConfiguration?: { workshopSkills?: unknown } }).workshopConfiguration
        ?.workshopSkills &&
      Array.isArray(
        (d as { proficiencyConfiguration?: { resources?: unknown } }).proficiencyConfiguration
          ?.resources,
      ),
  );
}

function loadDiskCache(): void {
  try {
    if (!fs.existsSync(CACHE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as GameConfigSnapshot & {
      fetchedAt?: number;
    };
    if (parsed?.data && isValidConfigData(parsed.data)) {
      memoryCache = { snapshot: parsed, fetchedAt: parsed.fetchedAt || 0 };
    }
  } catch (err) {
    console.warn('[game-config] cache de disco ilegible, se ignora:', (err as Error).message);
  }
}

function persistDiskCache(snapshot: GameConfigSnapshot, fetchedAt: number): void {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    const tmp = `${CACHE_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ ...snapshot, fetchedAt }));
    fs.renameSync(tmp, CACHE_FILE);
  } catch (err) {
    console.warn('[game-config] no se pudo persistir la cache:', (err as Error).message);
  }
}

/** Config oficial completa, con caché por checksum (TTL máximo CONFIG_TTL_MS). */
export async function getGameConfigSnapshot(forceRefresh = false): Promise<GameConfigSnapshot> {
  if (!memoryCache) loadDiskCache();
  const now = Date.now();
  const fresh = memoryCache && now - memoryCache.fetchedAt < CONFIG_TTL_MS;
  if (!forceRefresh && fresh && memoryCache) return memoryCache.snapshot;

  try {
    const head = await postGraphql<{ checksum?: string }>({ query: '{ checksum }' });
    const liveChecksum = head.checksum;
    if (
      memoryCache &&
      liveChecksum &&
      liveChecksum === memoryCache.snapshot.data.checksum
    ) {
      memoryCache.fetchedAt = now;
      return memoryCache.snapshot;
    }

    const query = fs.readFileSync(QUERY_PATH, 'utf8');
    const data = await postGraphql<Record<string, unknown>>({ query });
    if (!isValidConfigData(data)) throw new Error('config GraphQL con forma inesperada');

    const snapshot: GameConfigSnapshot = {
      meta: {
        checksum: (data.checksum as string) || liveChecksum || 'unknown',
        builtAt: new Date(now).toISOString(),
        source: 'live',
      },
      data,
    };
    memoryCache = { snapshot, fetchedAt: now };
    persistDiskCache(snapshot, now);
    return snapshot;
  } catch (err) {
    if (memoryCache) {
      console.warn(
        '[game-config] refresh falló, sirviendo cache:',
        (err as Error).message,
      );
      return memoryCache.snapshot;
    }
    throw err;
  }
}

export async function getGameConfigChecksum(): Promise<{ checksum: string; source: string }> {
  const snapshot = await getGameConfigSnapshot();
  return {
    checksum: snapshot.meta.checksum,
    source: snapshot.meta.source,
  };
}

/** Estado de la masterpiece en curso para un jugador (cache 60 s por UID). */
export async function getCurrentMasterpiece(userId: string): Promise<unknown> {
  const safeUserId = String(userId || '').trim();
  if (!safeUserId) throw new Error('userId requerido');

  const cached = masterpieceCache.get(safeUserId);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < MASTERPIECE_TTL_MS) return cached.data;

  const query = fs.readFileSync(MASTERPIECE_QUERY_PATH, 'utf8');
  const data = await postGraphql<unknown>({
    variables: { userId: safeUserId },
    query,
  });
  masterpieceCache.set(safeUserId, { data, fetchedAt: now });
  return data;
}
