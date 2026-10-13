/**
 * gameConfigService — Fuente única de verdad del cliente para la configuración
 * estática de Craft World (definiciones de fábricas/minas, tablas de maestría y
 * workshop, taxes, catálogos de traits/boosters/huevos/cofres...).
 *
 * Estrategia de carga (de inmediato a mejor):
 *   1. Fallbacks compilados en el bundle (`generated/staticFallbacks.ts`):
 *      siempre disponibles de forma síncrona; cubren maestría, workshop, taxes
 *      y power con los valores oficiales del último build.
 *   2. Snapshot público (`/data/gameConfigSnapshot.json`, ~3,6 MB): config
 *      completa, versionada por `checksum`.
 *   3. Refresco en vivo vía nuestro servidor (`/api/craftworld/game-config`),
 *      que a su vez consulta la query oficial AggregatedCraftWorldConfigurationQuery
 *      y cachea por checksum.
 *
 * Los getters son síncronos y leen el estado actual. `subscribeGameConfig()`
 * notifica cuando llega una versión nueva (para que React re-renderice).
 */

import {
  AREA_BOOST_TIME_REDUCTIONS,
  AREA_BOOST_UNLOCK_LEVEL_INDEX,
  FACTORY_META,
  MASTERY_INPUT_FACTORS,
  MASTERY_REQUIRED_AMOUNTS,
  MASTERY_SUPPORTED_SYMBOLS,
  MAX_POWER,
  TRADE_INPUT_TAX_RATE,
  WITHDRAW_TAX_RATE,
  PARTNER_TOKEN_PURCHASE_TAX_RATE,
  WORKSHOP_SPEED_BONUS,
} from './generated/staticFallbacks';
import type {
  FactoryDefinition,
  FactoryLevelDefinition,
  GameConfigData,
  GameConfigSnapshot,
  MineDefinition,
  ProficiencyResourceConfig,
  TraitDefinition,
  WorkshopSkillConfig,
} from './types';

export type GameConfigSource = 'fallbacks' | 'snapshot' | 'live';

const STORAGE_KEY = 'cc_game_config_v1';
const SNAPSHOT_URL = '/data/gameConfigSnapshot.json';
const SNAPSHOT_ETAG_FETCH_TIMEOUT_MS = 12000;

// Base del API propio. Sin proxy en Vite: en dev apunta a :5000; en producción
// el servidor sirve el cliente estático (same-origin). Se evita import.meta
// para que este módulo también compile bajo tsconfig.test.json (CommonJS).
function apiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000';
  }
  return '';
}

interface InternalState {
  data: GameConfigData;
  checksum: string;
  source: GameConfigSource;
}

/** Config mínima construida desde los fallbacks compilados: válida para todos
 *  los cálculos de maestría/workshop/tax/power aun sin red ni snapshot. */
function buildFallbackData(): GameConfigData {
  const proficiencyResources: ProficiencyResourceConfig[] = MASTERY_SUPPORTED_SYMBOLS.map(
    (symbol) => ({
      symbol,
      levels: MASTERY_INPUT_FACTORS.map((inputDiscountFactor, i) => ({
        inputDiscountFactor,
        requiredAmount: MASTERY_REQUIRED_AMOUNTS[symbol]?.[i] ?? 0,
      })),
    }),
  );
  const workshopSkills: WorkshopSkillConfig[] = Object.entries(WORKSHOP_SPEED_BONUS).map(
    ([symbol, levels]) => ({
      symbol,
      levels: levels.map((speedBonusPercentage) => ({
        speedBonusPercentage,
        requiredSkillPoints: 0,
      })),
    }),
  );
  return {
    checksum: FACTORY_META ? `fallbacks-${Object.keys(FACTORY_META).length}` : 'fallbacks',
    factoryDefinitions: [],
    mineDefinitions: [],
    landPlotDefinitions: [],
    levels: [],
    gameConfiguration: {
      maxPower: MAX_POWER,
      powerPerRefill: MAX_POWER,
      millisecondsToRefill: 7200000,
      areaBoostConfiguration: {
        unlockLevelIndex: AREA_BOOST_UNLOCK_LEVEL_INDEX,
        timeReductions: [...AREA_BOOST_TIME_REDUCTIONS],
        unlockedAmount: 0,
      },
      tax: {
        tradeInputTaxRate: TRADE_INPUT_TAX_RATE,
        withdrawTaxRate: WITHDRAW_TAX_RATE,
        partnerTokenPurchaseTaxRate: PARTNER_TOKEN_PURCHASE_TAX_RATE,
      },
    },
    workshopConfiguration: { workshopSkills },
    proficiencyConfiguration: { resources: proficiencyResources },
  };
}

let state: InternalState = {
  data: buildFallbackData(),
  checksum: 'fallbacks',
  source: 'fallbacks',
};

let configVersion = 0;
const listeners = new Set<() => void>();
let initPromise: Promise<void> | null = null;

function notify() {
  configVersion += 1;
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* un listener roto no debe frenar al resto */
    }
  });
}

function normalizeSymbol(symbol?: string): string {
  return String(symbol || '').trim().toUpperCase();
}

function isValidSnapshot(raw: unknown): raw is GameConfigSnapshot {
  const s = raw as GameConfigSnapshot;
  return Boolean(
    s &&
      s.meta &&
      typeof s.meta.checksum === 'string' &&
      s.data &&
      Array.isArray(s.data.factoryDefinitions) &&
      s.data.proficiencyConfiguration &&
      Array.isArray(s.data.proficiencyConfiguration.resources) &&
      s.data.workshopConfiguration &&
      Array.isArray(s.data.workshopConfiguration.workshopSkills),
  );
}

function setState(next: InternalState) {
  if (next.checksum === state.checksum && next.source === state.source) return;
  state = next;
  notify();
}

function persistLiveSnapshot(snapshot: GameConfigSnapshot) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...snapshot, savedAt: new Date().toISOString() }),
    );
  } catch {
    // cuota llena o storage deshabilitado: seguimos con el snapshot en memoria
  }
}

function readPersistedSnapshot(): GameConfigSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Inicialización idempotente: localStorage → snapshot público → live. */
export function initGameConfig(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const persisted = typeof localStorage !== 'undefined' ? readPersistedSnapshot() : null;
    if (persisted) {
      setState({ data: persisted.data, checksum: persisted.meta.checksum, source: 'snapshot' });
    }

    try {
      const res = await fetch(SNAPSHOT_URL, { signal: AbortSignal.timeout(SNAPSHOT_ETAG_FETCH_TIMEOUT_MS) });
      if (res.ok) {
        const snapshot = (await res.json()) as unknown;
        if (isValidSnapshot(snapshot) && snapshot.meta.checksum !== state.checksum) {
          setState({ data: snapshot.data, checksum: snapshot.meta.checksum, source: 'snapshot' });
        }
      }
    } catch {
      // sin snapshot local accesible: seguimos con fallbacks/persistencia
    }

    await refreshGameConfig().catch(() => undefined);
  })();
  return initPromise;
}

/**
 * Pide al servidor la config en vivo. Solo sustituye el estado si el checksum
 * cambió; en ese caso persiste en localStorage y notifica a los suscriptores.
 * El endpoint exige sesión: sin token no-op silencioso (fallbacks siguen).
 */
export async function refreshGameConfig(): Promise<void> {
  try {
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('cc_token') : null;
    if (!token) return;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const headRes = await fetch(`${apiBase()}/api/craftworld/game-config/checksum`, { headers });
    if (!headRes.ok) return;
    const { checksum: liveChecksum } = (await headRes.json()) as { checksum?: string };
    if (!liveChecksum || liveChecksum === state.checksum) return;

    const fullRes = await fetch(`${apiBase()}/api/craftworld/game-config`, { headers });
    if (!fullRes.ok) return;
    const snapshot = (await fullRes.json()) as unknown;
    if (!isValidSnapshot(snapshot)) return;
    setState({ data: snapshot.data, checksum: snapshot.meta.checksum, source: 'live' });
    persistLiveSnapshot(snapshot);
  } catch {
    // red no disponible o sesión no iniciada: el estado actual sigue siendo válido
  }
}

// ─── Suscripción (React) ─────────────────────────────────────────────────────

export function subscribeGameConfig(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getConfigVersion(): number {
  return configVersion;
}

export function getConfigState(): { checksum: string; source: GameConfigSource } {
  return { checksum: state.checksum, source: state.source };
}

export function getConfigData(): GameConfigData {
  return state.data;
}

/** Punto de extensión para tests: sustituye la config activa. */
export function setGameConfigDataForTests(data: Partial<GameConfigData>) {
  setState({
    data: { ...buildFallbackData(), ...data, checksum: data.checksum || 'test' } as GameConfigData,
    checksum: data.checksum || `test-${Date.now()}`,
    source: 'live',
  });
}

// ─── Fábricas ────────────────────────────────────────────────────────────────

export function getFactoryDefinition(symbol?: string): FactoryDefinition | undefined {
  const norm = normalizeSymbol(symbol);
  return state.data.factoryDefinitions.find((d) => normalizeSymbol(d.id) === norm);
}

export function getFactoryLevelConfig(
  symbol: string,
  level: number,
): FactoryLevelDefinition | undefined {
  const def = getFactoryDefinition(symbol);
  if (!def) return undefined;
  const idx = Math.max(1, Math.floor(level)) - 1;
  return def.levels[Math.min(idx, def.levels.length - 1)];
}

export function getMaxFactoryLevel(symbol: string): number {
  return getFactoryDefinition(symbol)?.levels.length || FACTORY_META[normalizeSymbol(symbol)]?.maxLevel || 0;
}

export function getFactoryMeta(symbol: string) {
  return FACTORY_META[normalizeSymbol(symbol)];
}

export function listFactorySymbols(): string[] {
  if (state.data.factoryDefinitions.length > 0) {
    return state.data.factoryDefinitions.map((d) => d.id);
  }
  return Object.keys(FACTORY_META);
}

export function getMineDefinition(symbol?: string): MineDefinition | undefined {
  const norm = normalizeSymbol(symbol);
  return state.data.mineDefinitions.find((d) => normalizeSymbol(d.id) === norm);
}

// ─── Maestría (proficiency): inputDiscountFactor multiplicativo ──────────────

/** Nivel máximo de maestría soportado por el juego (la tabla tiene 11 niveles). */
export function getMaxMasteryLevel(): number {
  return MASTERY_INPUT_FACTORS.length - 1;
}

function findProficiency(symbol: string): ProficiencyResourceConfig | undefined {
  const norm = normalizeSymbol(symbol);
  return state.data.proficiencyConfiguration.resources.find(
    (r) => normalizeSymbol(r.symbol) === norm,
  );
}

/**
 * Factor por el que el juego multiplica los insumos a una maestría dada
 * (1 = sin descuento; 0.95 = tope en nivel 10). Símbolos sin tabla de
 * proficiencia (las 24 líneas de evento) → 1, la maestría no les aplica.
 */
export function getMasteryInputFactor(symbol: string, level: number): number {
  const prof = findProficiency(symbol);
  if (!prof?.levels?.length) return 1;
  const capped = Math.max(0, Math.min(Math.floor(Number(level) || 0), prof.levels.length - 1));
  const factor = prof.levels[capped]?.inputDiscountFactor;
  return Number.isFinite(factor) && factor > 0 ? factor : 1;
}

/** Variante para módulos que sólo conocen el nivel (p. ej. simulaciones). */
export function getMasteryInputFactorByLevel(level: number): number {
  const capped = Math.max(
    0,
    Math.min(Math.floor(Number(level) || 0), MASTERY_INPUT_FACTORS.length - 1),
  );
  return MASTERY_INPUT_FACTORS[capped] ?? 1;
}

/** requiredAmount por nivel para un símbolo (cada recurso tiene umbrales distintos). */
export function getMasteryRequiredAmounts(symbol: string): readonly number[] {
  const prof = findProficiency(symbol);
  if (prof?.levels?.length) return prof.levels.map((l) => l.requiredAmount);
  return MASTERY_REQUIRED_AMOUNTS[normalizeSymbol(symbol)] || [];
}

// ─── Workshop: bono de velocidad (fracción) ──────────────────────────────────

/**
 * Fracción de reducción de duración por workshop (0.45 = −45% de tiempo).
 * Convención verificada contra el juego: el nivel mostrado N usa el índice N
 * del array de niveles. Símbolos sin workshop (líneas de evento) → 0.
 */
export function getWorkshopSpeedBonusFraction(symbol: string, level: number): number {
  const lvl = Math.floor(Number(level) || 0);
  if (lvl <= 0) return 0;
  const norm = normalizeSymbol(symbol);
  const skill = state.data.workshopConfiguration.workshopSkills.find(
    (s) => normalizeSymbol(s.symbol) === norm,
  );
  const table = skill?.levels?.length
    ? skill.levels.map((l) => l.speedBonusPercentage)
    : WORKSHOP_SPEED_BONUS[norm];
  if (!table || !table.length) return 0;
  const bonus = table[Math.min(lvl, table.length - 1)];
  return Number.isFinite(bonus) && bonus > 0 ? bonus : 0;
}

// ─── Taxes y comercio ────────────────────────────────────────────────────────

export function getTradeInputTaxRate(): number {
  return state.data.gameConfiguration?.tax?.tradeInputTaxRate ?? TRADE_INPUT_TAX_RATE;
}

export function getWithdrawTaxRate(): number {
  return state.data.gameConfiguration?.tax?.withdrawTaxRate ?? WITHDRAW_TAX_RATE;
}

export function getPartnerTokenPurchaseTaxRate(): number {
  return (
    state.data.gameConfiguration?.tax?.partnerTokenPurchaseTaxRate ??
    PARTNER_TOKEN_PURCHASE_TAX_RATE
  );
}

/** Multiplicador de lo recibido al vender en el exchange (2,5% de tax sobre el input). */
export function getSellRevenueMultiplier(): number {
  return 1 - getTradeInputTaxRate();
}

/** Multiplicador del coste al comprar en el exchange. */
export function getBuyCostMultiplier(): number {
  return 1 + getTradeInputTaxRate();
}

// ─── Boosts de área / power ──────────────────────────────────────────────────

export function getAreaBoostTimeReductions(): readonly number[] {
  const cfg = state.data.gameConfiguration?.areaBoostConfiguration?.timeReductions;
  return cfg?.length ? cfg : AREA_BOOST_TIME_REDUCTIONS;
}

export function getAreaBoostUnlockLevelIndex(): number {
  return state.data.gameConfiguration?.areaBoostConfiguration?.unlockLevelIndex ?? AREA_BOOST_UNLOCK_LEVEL_INDEX;
}

export function getMaxPower(): number {
  return state.data.gameConfiguration?.maxPower ?? MAX_POWER;
}

// ─── Catálogos ───────────────────────────────────────────────────────────────

export function getTraitDefinitions(): TraitDefinition[] {
  return state.data.traitDefinitions || [];
}

export function getTraitDefinition(id?: string): TraitDefinition | undefined {
  const norm = String(id || '').trim().toUpperCase();
  return getTraitDefinitions().find((t) => t.id.toUpperCase() === norm);
}

export function getBoosterDefinitions() {
  return state.data.boosterDefinitions || [];
}
