import type {
  EfficiencyItem,
  MasterpieceResourceMeta,
  ContributionTierId,
  TierContributionItem,
  PowerBracketStep,
} from '../types';
import { TIER_PERCENT_MULTIPLIERS } from '../data/masterpieceData';

/**
 * Computes power cost in COIN.
 * Power price is expressed as COIN per 100,000 Power units.
 */
export function calculatePowerCost(
  basePower: number,
  powerPricePer100k: number,
  multiplier = 1,
): number {
  if (basePower <= 0 || powerPricePer100k <= 0) return 0;
  const totalPower = basePower * multiplier;
  return totalPower * (powerPricePer100k / 100_000);
}

/**
 * Computes total cost in COIN for contributing this batch.
 */
export function calculateTotalCost(
  marketPrice: number,
  powerCost: number,
  multiplier = 1,
): number {
  const resourceCost = Math.max(0, marketPrice) * multiplier;
  return resourceCost + powerCost;
}

/**
 * Computes Efficiency: Total Crowns / Total Cost (Crowns per COIN)
 */
export function calculateEfficiency(
  baseCrowns: number,
  totalCost: number,
  multiplier = 1,
): number {
  if (totalCost <= 0) return 0;
  const totalCrowns = baseCrowns * multiplier;
  return totalCrowns / totalCost;
}

/**
 * Evaluates efficiency for all resources, merges live market prices,
 * supports custom units input and power escalation bracket index,
 * and sorts in descending order (highest Crowns/COIN first).
 */
export function computeEfficiencyList(
  resources: MasterpieceResourceMeta[],
  marketPrices: Record<string, number>,
  powerPricePer100k: number,
  multipliers: Record<string, number>,
  globalMultiplier = 1,
  resourceUnitsOrLang: Record<string, number> | string = {},
  resourceBrackets: Record<string, number> = {},
  langParam: string = 'en',
): EfficiencyItem[] {
  const resourceUnits = typeof resourceUnitsOrLang === 'object' && resourceUnitsOrLang !== null ? resourceUnitsOrLang : {};
  const lang = typeof resourceUnitsOrLang === 'string' ? resourceUnitsOrLang : langParam;

  const items: EfficiencyItem[] = resources.map((res) => {
    const symbol = res.symbol.toUpperCase();
    const multiplier = multipliers[symbol] ?? globalMultiplier ?? 1;
    const units = Math.max(1, resourceUnits[symbol] ?? 1);

    const brackets: PowerBracketStep[] =
      res.powerBrackets && res.powerBrackets.length > 0
        ? res.powerBrackets
        : [{ batchLimit: '∞', power: res.basePower }];

    const bracketIdx = Math.min(
      brackets.length - 1,
      Math.max(0, resourceBrackets[symbol] ?? 0),
    );

    const activeBracket = brackets[bracketIdx];
    const powerPerUnit = activeBracket.power * multiplier;

    // Use live market price if available, else fallback to estimated baseline
    const marketPrice = marketPrices[symbol] ?? res.baseMarketPriceEstimate;

    const powerCostPerUnit = calculatePowerCost(activeBracket.power, powerPricePer100k, multiplier);
    const costPerUnit = calculateTotalCost(marketPrice, powerCostPerUnit, multiplier);

    const totalCrowns = res.baseCrowns * multiplier * units;
    const totalPower = powerPerUnit * units;
    const totalCost = costPerUnit * units;

    // Efficiency is the Crowns per COIN ratio
    const efficiency = calculateEfficiency(res.baseCrowns, costPerUnit, multiplier);

    const name = lang === 'es' ? res.nameEs : res.nameEn;

    return {
      rank: 0,
      symbol: res.symbol,
      name,
      multiplier,
      units,
      bracketIndex: bracketIdx,
      powerBrackets: brackets,
      crowns: res.baseCrowns,
      power: powerPerUnit,
      marketPrice,
      totalCrowns,
      totalPower,
      totalCost,
      efficiency,
    };
  });

  // Sort descending by efficiency
  items.sort((a, b) => b.efficiency - a.efficiency);

  // Assign 1-indexed ranks
  return items.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

/**
 * Calculates required contributions for a given tier based on the 250% baseline
 */
export function computeTierContributions(
  resources: MasterpieceResourceMeta[],
  activeTier: ContributionTierId,
  userContributions: Record<string, number>,
  lang: string = 'en',
): TierContributionItem[] {
  const factor = TIER_PERCENT_MULTIPLIERS[activeTier] ?? 1.0;

  // Filter only resources that have tier requirements > 0
  const applicable = resources.filter((r) => r.goldTier250Required > 0);

  return applicable.map((res) => {
    const required = Math.max(1, Math.round(res.goldTier250Required * factor));
    const contributed = userContributions[res.symbol.toUpperCase()] ?? 0;
    const percent = Math.min(100, Math.round((contributed / required) * 100));
    const name = lang === 'es' ? res.nameEs : res.nameEn;

    return {
      symbol: res.symbol,
      name,
      required,
      contributed,
      percent,
    };
  });
}
