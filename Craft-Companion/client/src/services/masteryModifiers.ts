import {
  getMasteryInputFactor as getConfigMasteryInputFactor,
  getMasteryInputFactorByLevel,
  getMaxMasteryLevel,
} from './gameConfig';

export type ProficiencyItem = {
  symbol?: string;
  token?: string;
  resourceSymbol?: string;
  claimedLevel?: number;
  level?: number;
  collectedAmount?: number;
};

function normalizeSymbol(symbol?: string) {
  return String(symbol || '')
    .trim()
    .toUpperCase()
    .replace(/^TOKEN_/, '')
    .replace(/^RESOURCE_/, '')
    .replace(/[^A-Z0-9]/g, '');
}

function getProficiencySymbol(item: ProficiencyItem) {
  return normalizeSymbol(item.symbol || item.token || item.resourceSymbol);
}

function getProficiencyClaimedLevel(item?: ProficiencyItem) {
  const rawLevel = Number(item?.claimedLevel ?? item?.level ?? 0);
  const level = Math.floor(rawLevel);
  if (!Number.isFinite(level) || level <= 0) return 0;
  return Math.min(level, getMaxMasteryLevel());
}

export function getMasteryLevel(symbol: string, proficiencies: ProficiencyItem[]) {
  const normalized = normalizeSymbol(symbol);
  const item = proficiencies.find((entry) => getProficiencySymbol(entry) === normalized);
  return getProficiencyClaimedLevel(item);
}

/**
 * Factor oficial del juego (proficiencyConfiguration.inputDiscountFactor):
 * los insumos se MULTIPLICAN por este valor. Nivel 10 → ×0.95 (5% de ahorro).
 */
export function getMasteryInputFactor(symbol: string, proficiencies: ProficiencyItem[]) {
  return getConfigMasteryInputFactor(symbol, getMasteryLevel(symbol, proficiencies));
}

/** % de ahorro de insumos (0..5), derivado del factor oficial. */
export function getMasteryInputReductionPercent(symbol: string, proficiencies: ProficiencyItem[]) {
  const pct = (1 - getMasteryInputFactor(symbol, proficiencies)) * 100;
  return Math.max(0, Math.round(pct * 1e6) / 1e6);
}

/**
 * @deprecated Alias de compatibilidad: devuelve 1/factor×100, de modo que las
 * divisiones antiguas `amount / (bonus/100)` equivalen exactamente a ×factor.
 */
export function getMasteryYieldBonusPercent(symbol: string, proficiencies: ProficiencyItem[]) {
  return 100 / getMasteryInputFactor(symbol, proficiencies);
}

/** Aplica el descuento de insumos por maestría del PRODUCTO que se fabrica. */
export function applyMasteryInputReduction(
  amount: number,
  symbol: string,
  proficiencies: ProficiencyItem[],
) {
  const inputAmount = Number(amount || 0);
  if (!Number.isFinite(inputAmount) || inputAmount <= 0) return 0;
  return inputAmount * getMasteryInputFactor(symbol, proficiencies);
}

/** Factor por nivel sin contexto de jugador (simulaciones). */
export { getMasteryInputFactorByLevel };
