export type ProficiencyItem = {
  symbol?: string;
  token?: string;
  resourceSymbol?: string;
  claimedLevel?: number;
  level?: number;
  collectedAmount?: number;
};

const YIELD_BONUS_BY_LEVEL: Record<number, number> = {
  1: 102.04,
  2: 102.86,
  3: 103.29,
  4: 103.72,
  5: 104.15,
  6: 104.37,
  7: 104.59,
  8: 104.81,
  9: 105.03,
  10: 105.25,
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
  return Math.min(level, 10);
}

export function getMasteryLevel(symbol: string, proficiencies: ProficiencyItem[]) {
  const normalized = normalizeSymbol(symbol);
  const item = proficiencies.find((entry) => getProficiencySymbol(entry) === normalized);
  return getProficiencyClaimedLevel(item);
}

export function getMasteryYieldBonusPercent(symbol: string, proficiencies: ProficiencyItem[]) {
  const level = getMasteryLevel(symbol, proficiencies);
  if (!level) return 100;
  return YIELD_BONUS_BY_LEVEL[level] || 100;
}

export function getMasteryInputReductionPercent(symbol: string, proficiencies: ProficiencyItem[]) {
  return Math.max(0, getMasteryYieldBonusPercent(symbol, proficiencies) - 100);
}

export function applyMasteryInputReduction(
  amount: number,
  symbol: string,
  proficiencies: ProficiencyItem[],
) {
  const inputAmount = Number(amount || 0);
  if (!Number.isFinite(inputAmount) || inputAmount <= 0) return 0;

  const yieldBonus = getMasteryYieldBonusPercent(symbol, proficiencies);
  const mult = yieldBonus > 0 ? yieldBonus / 100 : 1;
  return inputAmount / mult;
}
