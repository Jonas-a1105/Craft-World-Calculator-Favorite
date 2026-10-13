import { getWorkshopSpeedBonusFraction } from './gameConfig';

export type WorkshopItem = {
  symbol?: string;
  level?: number;
};

function normalizeSymbol(symbol?: string) {
  return String(symbol || '')
    .trim()
    .toUpperCase();
}

export function getWorkshopUpgradeLevel(symbol: string, workshop: WorkshopItem[]) {
  const normalized = normalizeSymbol(symbol);
  const item = workshop.find((entry) => normalizeSymbol(entry.symbol) === normalized);
  const level = Math.floor(Number(item?.level || 0));
  if (!Number.isFinite(level) || level < 0) return 0;
  return level;
}

/** true si el símbolo tiene línea de workshop en el juego (las 24 fábricas de
 *  evento — comida, armas ninja, cadena del dyno-pez — no la tienen). */
export function hasWorkshopSkill(symbol: string) {
  return getWorkshopSpeedBonusFraction(symbol, 1) > 0;
}

/** % de REDUCCIÓN de duración (0..45). 0.45 → "45%" → duración ×0.55. */
export function getWorkshopSpeedBoostPercent(symbol: string, workshop: WorkshopItem[]) {
  const level = getWorkshopUpgradeLevel(symbol, workshop);
  return getWorkshopSpeedBonusFraction(symbol, level) * 100;
}

/**
 * Física oficial del juego (verificada contra /me/craft-world en vivo):
 * duración_final = base × (1 − bonus). Ej.: STEEL 720 min con bonus 0.45 →
 * 396 min exactos. NO es duración / (1 + bonus).
 */
export function applyWorkshopSpeedToDuration(
  durationMinutes: number,
  symbol: string,
  workshop: WorkshopItem[],
) {
  const duration = Number(durationMinutes || 0);
  if (!Number.isFinite(duration) || duration <= 0) return duration;
  const bonus = getWorkshopSpeedBonusFraction(symbol, getWorkshopUpgradeLevel(symbol, workshop));
  if (bonus <= 0) return duration;
  return duration * (1 - bonus);
}

export function getRunsPerHourWithWorkshop(
  durationMinutes: number,
  symbol: string,
  workshop: WorkshopItem[],
) {
  const adjustedDuration = applyWorkshopSpeedToDuration(durationMinutes, symbol, workshop);
  return adjustedDuration > 0 && Number.isFinite(adjustedDuration) ? 60 / adjustedDuration : 0;
}
