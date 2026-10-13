import {
  FACTORIES_DATA,
  MASTERY_MULTIPLIERS,
  RESOURCE_METADATA,
  getDefinedPoolUrl,
  getMaxFactoryLevel,
} from '../data/baseCostCatalog';
import { markupPercentOnCost } from '../../../services/financial/pricingService';
import { getTradeInputTaxRate } from '../../../services/gameConfig';
import type {
  BaseCostRowData,
  BaseCostSettings,
  BaseCostSummaryStats,
  BaseResourceDecomposition,
  FactoryLevelConfig,
} from '../types';

export const EMPTY_DECOMPOSITION: BaseResourceDecomposition = {
  earth: 0,
  water: 0,
  fire: 0,
  dust: 0,
  lumber: 0,
  powerPerUnit: 0,
};

/**
 * Recursively calculates base resources (Earth, Water, Fire, Dust, Lumber)
 * and total accumulated power consumed per 1 unit of crafted token.
 */
export function calcBaseResources(
  token: string,
  levels: Record<string, number>,
  masteries: Record<string, number>,
  factoriesMap: Record<string, FactoryLevelConfig[]> = FACTORIES_DATA,
  visited = new Set<string>(),
  forcedMastery?: number,
): BaseResourceDecomposition {
  const norm = token.toUpperCase();

  if (norm === 'EARTH') return { ...EMPTY_DECOMPOSITION, earth: 1 };
  if (norm === 'WATER') return { ...EMPTY_DECOMPOSITION, water: 1 };
  if (norm === 'FIRE') return { ...EMPTY_DECOMPOSITION, fire: 1 };
  if (norm === 'DUST') return { ...EMPTY_DECOMPOSITION, dust: 1 };
  if (norm === 'LUMBER') return { ...EMPTY_DECOMPOSITION, lumber: 1 };

  if (visited.has(norm)) return { ...EMPTY_DECOMPOSITION };

  const fList = factoriesMap[norm];
  if (!fList || !fList.length) return { ...EMPTY_DECOMPOSITION };

  const curLvl = levels[norm] ?? 1;
  const f = fList.find((x) => x.level === curLvl) ?? fList[0];
  if (!f || f.output <= 0) return { ...EMPTY_DECOMPOSITION };

  const mLevel = Math.min(
    10,
    Math.max(0, forcedMastery !== undefined ? forcedMastery : (masteries[norm] ?? 0)),
  );
  const mult = MASTERY_MULTIPLIERS[mLevel] ?? 1;
  const nextVisited = new Set(visited).add(norm);

  const res: BaseResourceDecomposition = {
    ...EMPTY_DECOMPOSITION,
    powerPerUnit: f.powerCost / f.output,
  };

  const inputs = [f.input1, f.input2].filter(Boolean);
  for (const inp of inputs) {
    if (!inp) continue;
    const ratio = inp.amount / f.output / mult;
    const sub = calcBaseResources(
      inp.symbol,
      levels,
      masteries,
      factoriesMap,
      nextVisited,
      forcedMastery,
    );
    res.earth += sub.earth * ratio;
    res.water += sub.water * ratio;
    res.fire += sub.fire * ratio;
    res.dust += sub.dust * ratio;
    res.lumber += sub.lumber * ratio;
    res.powerPerUnit += sub.powerPerUnit * ratio;
  }

  return res;
}

/**
 * Calculates financial metrics for a single craftable resource row.
 */
export function calculateBaseCostRow(
  token: string,
  levels: Record<string, number>,
  masteries: Record<string, number>,
  settings: BaseCostSettings,
  prices: Record<string, number>,
  category: string,
  factoriesMap: Record<string, FactoryLevelConfig[]> = FACTORIES_DATA,
): BaseCostRowData {
  const norm = token.toUpperCase();
  const meta = RESOURCE_METADATA[norm] ?? {
    name: norm,
    element: 'special',
    tier: 1,
    icon: `/assets/resources/${norm.charAt(0) + norm.slice(1).toLowerCase()}.png`,
  };

  const curLevel = levels[norm] ?? 1;
  const maxLevel = getMaxFactoryLevel(norm);
  const mastery = Math.min(10, Math.max(0, masteries[norm] ?? 0));
  const forcedMastery = settings.masteryMode === 'chain' ? mastery : undefined;

  const decomp = calcBaseResources(
    norm,
    levels,
    masteries,
    factoriesMap,
    new Set(),
    forcedMastery,
  );

  const buyMult = settings.buySlippage ? 1 + settings.buySlippagePct / 100 : 1;
  const sellMult = settings.sellSlippage
    ? 1 - settings.sellSlippagePct / 100
    : 1;
  // Tax oficial del exchange (tradeInputTaxRate, hoy 2,5%) — no el 5% que se
  // asumía antes.
  const feeMult = settings.marketFee
    ? 1 - (settings.marketFeePct ?? getTradeInputTaxRate() * 100) / 100
    : 1;

  const earthPrice = prices.EARTH ?? 0;
  const waterPrice = prices.WATER ?? 0;
  const firePrice = prices.FIRE ?? 0;
  const dustPrice = prices.DUST ?? 0;
  const lumberPrice = prices.LUMBER ?? 0;

  const rawBaseCost =
    decomp.earth * earthPrice +
    decomp.water * waterPrice +
    decomp.fire * firePrice +
    decomp.dust * dustPrice +
    decomp.lumber * lumberPrice;

  const baseCost = rawBaseCost * buyMult;
  const powerCoin = decomp.powerPerUnit * (settings.powerPricePer100k / 100_000);
  const totalCost = baseCost + powerCoin;

  const tokenPrice = prices[norm] ?? 0;
  const sellPrice = tokenPrice * sellMult * feeMult;
  const profit = sellPrice - totalCost;

  const marginPct = markupPercentOnCost(sellPrice, baseCost);

  // Make vs Buy & Smart Routing Analysis
  const isRootResource = ['EARTH', 'WATER', 'FIRE', 'DUST', 'LUMBER'].includes(norm);
  const marketBuyPrice = tokenPrice * buyMult;

  let directInputs: import('../types').DirectInputDetail[] = [];
  let directCraftCost = totalCost;
  let hybridCraftCost = totalCost;
  const baseElementalCraftCost = totalCost;
  let cheapestCost = totalCost;
  let bestStrategy: import('../types').OptimalStrategy = 'buy_market';
  let savingsPct = 0;
  let isCraftCheaper = false;

  if (isRootResource) {
    cheapestCost = marketBuyPrice > 0 ? marketBuyPrice : totalCost;
    bestStrategy = 'buy_market';
    savingsPct = 0;
    isCraftCheaper = false;
  } else {
    const fList = factoriesMap[norm];
    const f = fList ? (fList.find((x) => x.level === curLevel) ?? fList[0]) : null;
    const mult = MASTERY_MULTIPLIERS[mastery] ?? 1;

    let directInputsMarketCost = 0;
    let hybridInputsCost = 0;
    const directPowerCoin =
      f && f.output > 0
        ? (f.powerCost / f.output) * (settings.powerPricePer100k / 100_000)
        : 0;

    if (f && f.output > 0) {
      const rawInputs = [f.input1, f.input2].filter(Boolean);
      for (const inp of rawInputs) {
        if (!inp) continue;
        const amountPerUnit = inp.amount / f.output / mult;
        const inpSym = inp.symbol.toUpperCase();
        const inpMeta = RESOURCE_METADATA[inpSym] ?? { name: inpSym };
        const inpRawPrice = prices[inpSym] ?? 0;
        const inpMarketPrice = inpRawPrice * buyMult;
        const totalMarketCost = amountPerUnit * inpMarketPrice;

        // Calculate cost to craft this component from its elemental base
        const inpDecomp = calcBaseResources(
          inpSym,
          levels,
          masteries,
          factoriesMap,
          new Set(),
          forcedMastery,
        );
        const inpRawBaseCost =
          inpDecomp.earth * earthPrice +
          inpDecomp.water * waterPrice +
          inpDecomp.fire * firePrice +
          inpDecomp.dust * dustPrice +
          inpDecomp.lumber * lumberPrice;
        const inpBaseCost = inpRawBaseCost * buyMult;
        const inpPowerCoin =
          inpDecomp.powerPerUnit * (settings.powerPricePer100k / 100_000);
        const cheapestCraftCost = inpBaseCost + inpPowerCoin;

        // Make vs buy decision for this specific input
        const isInputCraftCheaper =
          cheapestCraftCost > 0 &&
          inpMarketPrice > 0 &&
          cheapestCraftCost < inpMarketPrice;
        const bestAction: 'buy' | 'craft' = isInputCraftCheaper ? 'craft' : 'buy';
        const inputSavingsPct =
          inpMarketPrice > 0
            ? Math.abs(((inpMarketPrice - cheapestCraftCost) / inpMarketPrice) * 100)
            : 0;

        directInputs.push({
          symbol: inpSym,
          name: inpMeta.name,
          amountPerUnit,
          marketPrice: inpMarketPrice,
          totalMarketCost,
          cheapestCraftCost,
          bestAction,
          savingsPct: inputSavingsPct,
        });

        directInputsMarketCost += totalMarketCost;
        const effectivePrice = isInputCraftCheaper ? cheapestCraftCost : inpMarketPrice;
        hybridInputsCost += effectivePrice * amountPerUnit;
      }
    }

    directCraftCost = directInputsMarketCost + directPowerCoin;
    hybridCraftCost = hybridInputsCost + directPowerCoin;

    const craftOptions: {
      type: 'craft_direct' | 'craft_hybrid' | 'craft_base';
      cost: number;
    }[] = [
      { type: 'craft_direct' as const, cost: directCraftCost },
      { type: 'craft_hybrid' as const, cost: hybridCraftCost },
      { type: 'craft_base' as const, cost: baseElementalCraftCost },
    ].filter((o) => o.cost > 0);

    const cheapestCraft =
      craftOptions.length > 0
        ? craftOptions.reduce((min, o) => (o.cost < min.cost ? o : min), craftOptions[0])
        : { type: 'craft_direct' as const, cost: directCraftCost };

    if (
      marketBuyPrice > 0 &&
      cheapestCraft.cost > 0 &&
      cheapestCraft.cost < marketBuyPrice - 0.000001
    ) {
      bestStrategy = cheapestCraft.type;
      cheapestCost = cheapestCraft.cost;
      savingsPct = ((marketBuyPrice - cheapestCraft.cost) / marketBuyPrice) * 100;
      isCraftCheaper = true;
    } else if (marketBuyPrice > 0 && cheapestCraft.cost > 0) {
      bestStrategy = 'buy_market';
      cheapestCost = marketBuyPrice;
      savingsPct = ((cheapestCraft.cost - marketBuyPrice) / cheapestCraft.cost) * 100;
      isCraftCheaper = false;
    } else if (cheapestCraft.cost > 0) {
      bestStrategy = cheapestCraft.type;
      cheapestCost = cheapestCraft.cost;
      savingsPct = 0;
      isCraftCheaper = true;
    }
  }

  return {
    token: norm,
    name: meta.name,
    element: meta.element,
    category,
    tier: meta.tier,
    iconUrl: meta.icon,
    poolUrl: getDefinedPoolUrl(norm),
    curLevel,
    maxLevel,
    mastery,
    earth: decomp.earth,
    water: decomp.water,
    fire: decomp.fire,
    dust: decomp.dust,
    lumber: decomp.lumber,
    powerPerUnit: decomp.powerPerUnit,
    baseCost,
    powerCoin,
    totalCost,
    sellPrice,
    profit,
    marginPct,
    isRootResource,
    marketBuyPrice,
    directInputs,
    directCraftCost,
    baseElementalCraftCost,
    hybridCraftCost,
    cheapestCost,
    bestStrategy,
    savingsPct,
    isCraftCheaper,
  };
}

/**
 * Computes high-level summary statistics across all rows.
 */
export function calculateSummaryStats(
  rows: BaseCostRowData[],
  prices: Record<string, number>,
): BaseCostSummaryStats {
  let profitableCount = 0;
  let unprofitableCount = 0;
  let sumMargin = 0;
  let validMarginCount = 0;

  let bestProfitItem: BaseCostSummaryStats['bestProfitItem'] = null;
  let worstProfitItem: BaseCostSummaryStats['worstProfitItem'] = null;

  for (const row of rows) {
    if (row.profit > 0) profitableCount += 1;
    else if (row.profit < 0) unprofitableCount += 1;

    if (row.marginPct !== null && Number.isFinite(row.marginPct)) {
      sumMargin += row.marginPct;
      validMarginCount += 1;

      if (!bestProfitItem || row.marginPct > bestProfitItem.marginPct) {
        bestProfitItem = {
          token: row.token,
          name: row.name,
          profit: row.profit,
          marginPct: row.marginPct,
        };
      }

      if (!worstProfitItem || row.marginPct < worstProfitItem.marginPct) {
        worstProfitItem = {
          token: row.token,
          name: row.name,
          profit: row.profit,
          marginPct: row.marginPct,
        };
      }
    }
  }

  return {
    totalTracked: rows.length,
    profitableCount,
    unprofitableCount,
    avgMarginPct: validMarginCount > 0 ? sumMargin / validMarginCount : 0,
    bestProfitItem,
    worstProfitItem,
    elementalPrices: {
      earth: prices.EARTH ?? 0,
      water: prices.WATER ?? 0,
      fire: prices.FIRE ?? 0,
      dust: prices.DUST ?? 0,
      lumber: prices.LUMBER ?? 0,
    },
  };
}
