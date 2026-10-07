import type { FactoryDataRow } from '../../../services/factoryData';
import {
  calculateFactoryCycle,
  buildRecipeTree,
  flattenRecipeToBaseResources,
} from '../../../services/craftworldCalculations';
import {
  applyMasteryInputReduction,
  getMasteryInputReductionPercent,
} from '../../../services/masteryModifiers';
import { formatNumber } from '../../../utils/formatters';
import type {
  AdjustedCycleResult,
  FactorySummary,
  FilterMode,
  InputSupplyMode,
  ProfitabilityContext,
  SortByOption,
} from '../types';

export function extractOwnedMap(homeData: any): Map<string, number> {
  const ownedMap = new Map<string, number>();
  const landPlots = homeData?.craftWorld?.landPlots || [];

  landPlots.forEach((plot: any) => {
    (plot.areas || []).forEach((area: any) => {
      (area.factories || []).forEach((facObj: any) => {
        const symbol = (facObj?.factory?.definition?.id || '').toUpperCase();
        const rawLevel =
          typeof facObj?.factory?.level === 'number' ? facObj.factory.level : 0;
        const displayLevel = rawLevel + 1;
        if (symbol) {
          const current = ownedMap.get(symbol) || 0;
          if (displayLevel > current) ownedMap.set(symbol, displayLevel);
        }
      });
    });
  });

  return ownedMap;
}

export function getAdjustedCycle({
  row,
  prices,
  context,
  inputSupplyMode,
  allRows,
  useMastery,
}: {
  row: FactoryDataRow;
  prices: Record<string, number>;
  context: ProfitabilityContext;
  inputSupplyMode: InputSupplyMode;
  allRows: FactoryDataRow[];
  useMastery: boolean;
}): AdjustedCycleResult {
  const baseCycle = calculateFactoryCycle(row, prices, context);

  if (inputSupplyMode === 'self_crafted') {
    const tree = buildRecipeTree(allRows, row.token, 1, row.level);
    const baseReqs = flattenRecipeToBaseResources(tree, {});

    const parentMasteryRed = useMastery
      ? getMasteryInputReductionPercent(row.token, context.proficiencies || [])
      : 0;

    let rawCostPerOutput = 0;
    const rawTextParts: string[] = [];

    Object.entries(baseReqs).forEach(([tok, amt]) => {
      if (tok !== row.token) {
        const adjustedAmt = useMastery
          ? applyMasteryInputReduction(amt, tok, context.proficiencies || [])
          : amt;

        const finalAmtPerUnit = adjustedAmt * (1 - parentMasteryRed / 100);
        const p =
          typeof prices[tok] === 'number' && prices[tok] > 0
            ? prices[tok]
            : 0.00394;
        rawCostPerOutput += finalAmtPerUnit * p;
        rawTextParts.push(
          `${tok} (${formatNumber(finalAmtPerUnit * baseCycle.outputPerCycle, 1)})`,
        );
      }
    });

    const effectiveInputCost = rawCostPerOutput * baseCycle.outputPerCycle;
    const effectiveProfitPerCycle =
      baseCycle.revenuePerCycle - effectiveInputCost;
    const effectiveProfitPerHour =
      effectiveProfitPerCycle * baseCycle.runsPerHour;
    const effectiveProfitPerDay = effectiveProfitPerCycle * baseCycle.runsPerDay;

    return {
      ...baseCycle,
      effectiveInputCost,
      effectiveProfitPerCycle,
      effectiveProfitPerHour,
      effectiveProfitPerDay,
      rawBaseMaterialsText: rawTextParts.join(', '),
    };
  }

  return {
    ...baseCycle,
    effectiveInputCost: baseCycle.inputCostPerCycle,
    effectiveProfitPerCycle: baseCycle.profitPerCycle,
    effectiveProfitPerHour: baseCycle.profitPerHour,
    effectiveProfitPerDay: baseCycle.profitPerDay,
  };
}

export function buildFactorySummaries({
  rows,
  ownedMap,
  prices,
  context,
  inputSupplyMode,
  useMastery,
}: {
  rows: FactoryDataRow[];
  ownedMap: Map<string, number>;
  prices: Record<string, number>;
  context: ProfitabilityContext;
  inputSupplyMode: InputSupplyMode;
  useMastery: boolean;
}): FactorySummary[] {
  const uniqueTokens = Array.from(new Set(rows.map((r) => r.token)));

  return uniqueTokens.map((token) => {
    const tokenRows = rows
      .filter((r) => r.token === token)
      .sort((a, b) => a.level - b.level);
    const ownedLevel = ownedMap.get(token.toUpperCase());
    const targetLevel = ownedLevel || 1;
    const activeRow =
      tokenRows.find((r) => r.level === targetLevel) || tokenRows[0];
    const cycle = getAdjustedCycle({
      row: activeRow,
      prices,
      context,
      inputSupplyMode,
      allRows: rows,
      useMastery,
    });

    return {
      token,
      ownedLevel: ownedLevel || null,
      activeRow,
      cycle,
      allRows: tokenRows,
    };
  });
}

export function filterAndSortSummaries({
  summaries,
  search,
  filterMode,
  sortBy,
}: {
  summaries: FactorySummary[];
  search: string;
  filterMode: FilterMode;
  sortBy: SortByOption;
}): FactorySummary[] {
  const filtered = summaries.filter((s) => {
    const matchesSearch =
      s.token.toLowerCase().includes(search.toLowerCase()) ||
      s.activeRow.output_token.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'owned') return s.ownedLevel !== null;
    if (filterMode === 'profitable') return s.cycle.effectiveProfitPerDay > 0;
    if (filterMode === 'loss') return s.cycle.effectiveProfitPerDay < 0;
    return true;
  });

  return filtered.sort((a, b) => {
    if (sortBy === 'profit_hour')
      return b.cycle.effectiveProfitPerHour - a.cycle.effectiveProfitPerHour;
    if (sortBy === 'profit_day')
      return b.cycle.effectiveProfitPerDay - a.cycle.effectiveProfitPerDay;
    if (sortBy === 'xp_hour') return b.cycle.xpPerHour - a.cycle.xpPerHour;
    if (sortBy === 'margin')
      return (b.cycle.marginPercent || 0) - (a.cycle.marginPercent || 0);
    if (sortBy === 'alphabetical') return a.token.localeCompare(b.token);
    return 0;
  });
}
