import {
  CRYSTAL_PRICE_USD,
  CRYSTAL_PRICE_USD_SUB,
  MAX_DAILY_SUB_CRYSTALS,
} from '../data/powerSimulatorData';
import type {
  PassivePlantLevel,
  PlantState,
  PowerPackState,
  CostComparisonRow,
  PowerSimulatorSummary,
} from '../types';

/**
 * Calculates the crystal cost of a specific purchase (1-indexed).
 * Scaled: baseCost * (min(purchaseNumber, 5) + 1) / 2
 * - Purchase 1: 1.0x base
 * - Purchase 2: 1.5x base
 * - Purchase 3: 2.0x base
 * - Purchase 4: 2.5x base
 * - Purchase 5+: 3.0x base
 */
export function calculatePackStepCost(baseCost: number, purchaseNumber: number): number {
  if (purchaseNumber <= 0) return 0;
  return (baseCost * (Math.min(purchaseNumber, 5) + 1)) / 2;
}

/**
 * Calculates cumulative crystals needed for `count` purchases of a pack tier.
 */
export function calculateCumulativePackCost(baseCost: number, count: number): number {
  if (count <= 0) return 0;
  const s = Math.min(count, 5);
  const initialSum = (baseCost * s * (s + 3)) / 4;
  const overflowPurchases = Math.max(count - 5, 0);
  return initialSum + overflowPurchases * calculatePackStepCost(baseCost, 5);
}

/**
 * Evaluates the value of 1 crystal in COIN based on the live COIN USD price.
 */
export function calculateCrystalPriceInCoin(coinUsdPrice?: number | null): number | null {
  if (!coinUsdPrice || coinUsdPrice <= 0 || !Number.isFinite(coinUsdPrice)) {
    return null;
  }
  return CRYSTAL_PRICE_USD / coinUsdPrice;
}

/**
 * Calculates the COIN discount granted by the Crystal Pass subscription
 * on the first 150 crystals spent per day.
 */
export function calculateCrystalPassDiscount(
  totalDailyCrystals: number,
  coinUsdPrice?: number | null,
  isSubActive = false,
): number {
  if (!isSubActive || !coinUsdPrice || coinUsdPrice <= 0 || totalDailyCrystals <= 0) {
    return 0;
  }
  const eligibleCrystals = Math.min(totalDailyCrystals, MAX_DAILY_SUB_CRYSTALS);
  return (eligibleCrystals * (CRYSTAL_PRICE_USD - CRYSTAL_PRICE_USD_SUB)) / coinUsdPrice;
}

/**
 * Calculates the hourly power produced by a passive plant setup.
 */
export function calculatePassiveHourly(
  levels: PassivePlantLevel[],
  state: PlantState,
): number {
  if (state.level <= 0 || state.count <= 0) return 0;
  const lvl = levels.find((l) => l.level === state.level);
  if (!lvl) return 0;
  const cyclesPerHour = 3600 / lvl.cycleSec;
  return lvl.powerPerCycle * cyclesPerHour * state.count;
}

/**
 * Calculates effective cost in COIN per 100,000 Power units.
 */
export function calculateEffectiveCoinPer100k(
  costCoin: number | null,
  powerUnits: number,
): number | null {
  if (costCoin === null || powerUnits <= 0 || costCoin <= 0) return null;
  return (costCoin / powerUnits) * 100_000;
}

/**
 * Formats power numbers cleanly (e.g., 2.1k, 37.8k, 8.45M).
 */
export function formatPower(val: number): string {
  if (!Number.isFinite(val) || val <= 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1)}k`;
  }
  return val.toFixed(0);
}

/**
 * Formats COIN amounts cleanly.
 */
export function formatCoin(val: number | null): string {
  if (val === null || !Number.isFinite(val)) return '—';
  if (val === 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(2)}k`;
  }
  return val >= 10 ? val.toFixed(2) : val.toFixed(3);
}

/**
 * Generates the full comparative ranking of Power Pack purchase options.
 */
export function generateCostComparisonRows(
  capacity: number,
  coinUsdPrice: number | null,
): CostComparisonRow[] {
  const crystalPriceCoin = calculateCrystalPriceInCoin(coinUsdPrice);
  const rows: CostComparisonRow[] = [];

  for (let purchase = 1; purchase <= 3; purchase++) {
    // 25% Pack
    const power25 = 0.25 * capacity;
    const crystals25 = calculatePackStepCost(50, purchase);
    const equivCoin25 = crystalPriceCoin !== null ? crystals25 * crystalPriceCoin : null;
    const coinPer100k25 =
      equivCoin25 !== null && power25 > 0 ? (equivCoin25 / power25) * 100_000 : null;

    rows.push({
      label: `Power Pack +25% #${purchase}`,
      periodText: `${crystals25} 🍃 / purchase`,
      power: power25,
      powerText: formatPower(power25),
      crystals: crystals25,
      crystalEquivalentCoin: equivCoin25,
      resourceCostCoin: 0,
      coinPer100k: coinPer100k25,
      isCheapest: false,
      colorHsl: null,
    });

    // 100% Pack
    const power100 = 1.0 * capacity;
    const crystals100 = calculatePackStepCost(150, purchase);
    const equivCoin100 = crystalPriceCoin !== null ? crystals100 * crystalPriceCoin : null;
    const coinPer100k100 =
      equivCoin100 !== null && power100 > 0 ? (equivCoin100 / power100) * 100_000 : null;

    rows.push({
      label: `Power Pack +100% #${purchase}`,
      periodText: `${crystals100} 🍃 / purchase`,
      power: power100,
      powerText: formatPower(power100),
      crystals: crystals100,
      crystalEquivalentCoin: equivCoin100,
      resourceCostCoin: 0,
      coinPer100k: coinPer100k100,
      isCheapest: false,
      colorHsl: null,
    });
  }

  // Sort ascending by coinPer100k
  rows.sort((a, b) => {
    if (a.coinPer100k === null && b.coinPer100k === null) return 0;
    if (a.coinPer100k === null) return 1;
    if (b.coinPer100k === null) return -1;
    return a.coinPer100k - b.coinPer100k;
  });

  // Assign ranking colors and mark cheapest
  const validCount = rows.filter((r) => r.coinPer100k !== null).length;
  let validIndex = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.coinPer100k !== null) {
      if (validIndex === 0) {
        row.isCheapest = true;
      }
      const fraction = validCount > 1 ? Math.min(validIndex / (validCount - 1), 1) : 0;
      const hue = Math.round(120 * (1 - fraction)); // 120 (green) down to 0 (red)
      row.colorHsl = `hsl(${hue}, 72%, 55%)`;
      validIndex++;
    }
  }

  return rows;
}

/**
 * Calculates complete daily power balance and effective costs.
 */
export function computePowerSimulatorSummary(
  airstreamHourly: number,
  sunforgeHourly: number,
  packState: PowerPackState,
  coinUsdPrice: number | null,
): PowerSimulatorSummary {
  const freeHourly = airstreamHourly + sunforgeHourly;
  const freePowerDaily = freeHourly * 24;

  const paidPowerDaily =
    packState.packs25PerDay * packState.capacity * 0.25 +
    packState.packs50PerDay * packState.capacity * 0.5 +
    packState.packs100PerDay * packState.capacity * 1.0;

  const totalDailyPower = freePowerDaily + paidPowerDaily;

  const totalCrystalsDaily =
    calculateCumulativePackCost(50, packState.packs25PerDay) +
    calculateCumulativePackCost(150, packState.packs100PerDay);

  const crystalPriceCoin = calculateCrystalPriceInCoin(coinUsdPrice);
  const crystalsCostCoin =
    crystalPriceCoin !== null ? totalCrystalsDaily * crystalPriceCoin : null;

  const crystalPassDiscountCoin = calculateCrystalPassDiscount(
    totalCrystalsDaily,
    coinUsdPrice,
    packState.activateCrystalPass,
  );

  const effectiveTotalCostCoin =
    crystalsCostCoin !== null ? Math.max(0, crystalsCostCoin - crystalPassDiscountCoin) : null;

  const effectiveCoinPer100k =
    effectiveTotalCostCoin !== null && totalDailyPower > 0
      ? calculateEffectiveCoinPer100k(effectiveTotalCostCoin, totalDailyPower)
      : null;

  return {
    freePowerHourly: freeHourly,
    freePowerDaily,
    paidPowerDaily,
    totalDailyPower,
    totalCrystalsDaily,
    crystalsCostCoin,
    crystalPassDiscountCoin,
    effectiveTotalCostCoin,
    effectiveCoinPer100k,
  };
}
