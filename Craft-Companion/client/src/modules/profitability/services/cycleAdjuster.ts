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
import { getWorkshopSpeedBoostPercent } from '../../../services/workshopModifiers';
import {
  calculateBoosterMultiplier,
  calculateWorkerReductionFactor,
} from '../../timers/services/factoryTimersService';
import type {
  AdjustedCycleResult,
  FactorySummary,
  FilterMode,
  InputSupplyMode,
  ProfitabilityContext,
  SortByOption,
  SimulationMode,
  ModifierBadgeInfo,
} from '../types';

import type {
  CraftworldHomePayload,
  CraftworldLandPlot,
  CraftworldLandArea,
  CraftworldFactoryInstance,
} from '../../../types';

export function extractOwnedMap(homeData?: CraftworldHomePayload | null): Map<string, number> {
  const ownedMap = new Map<string, number>();
  const landPlots = homeData?.craftWorld?.landPlots || [];

  landPlots.forEach((plot: CraftworldLandPlot) => {
    (plot.areas || []).forEach((area: CraftworldLandArea) => {
      (area.factories || []).forEach((facObj: CraftworldFactoryInstance) => {
        const symbol = (facObj?.factory?.definition?.id || facObj?.symbol || '').toUpperCase();
        const rawLevel =
          typeof facObj?.factory?.level === 'number' && facObj.factory.level > 0
            ? facObj.factory.level
            : typeof facObj?.level === 'number' && facObj.level > 0
              ? facObj.level
              : 1;
        const displayLevel = rawLevel;
        if (symbol) {
          const current = ownedMap.get(symbol) || 0;
          if (displayLevel > current) ownedMap.set(symbol, displayLevel);
        }
      });
    });
  });

  return ownedMap;
}

export interface PlotFactoryInstanceDetail {
  token: string;
  level: number;
  boosters: Array<{ boostValue?: number; startTime?: string; endTime?: string }>;
  workerBoostIntervals: Array<{ boostValue?: number }>;
  craftingReduction?: number;
}

export function extractPlotFactoriesMap(
  homeData?: CraftworldHomePayload | null,
): Map<string, PlotFactoryInstanceDetail> {
  const map = new Map<string, PlotFactoryInstanceDetail>();
  const landPlots = homeData?.craftWorld?.landPlots || [];

  landPlots.forEach((plot: CraftworldLandPlot) => {
    (plot.areas || []).forEach((area: CraftworldLandArea) => {
      (area.factories || []).forEach((facObj: CraftworldFactoryInstance) => {
        const symbol = (facObj?.factory?.definition?.id || facObj?.symbol || '').toUpperCase();
        const rawLevel =
          typeof facObj?.factory?.level === 'number' && facObj.factory.level > 0
            ? facObj.factory.level
            : typeof facObj?.level === 'number' && facObj.level > 0
              ? facObj.level
              : 1;
        if (symbol) {
          const existing = map.get(symbol);
          if (!existing || rawLevel >= existing.level) {
            map.set(symbol, {
              token: symbol,
              level: rawLevel,
              boosters: Array.isArray(facObj.boosters) ? facObj.boosters : [],
              workerBoostIntervals: Array.isArray(facObj.workerBoostIntervals)
                ? facObj.workerBoostIntervals
                : [],
              craftingReduction:
                typeof facObj.craftingReduction === 'number' ? facObj.craftingReduction : undefined,
            });
          }
        }
      });
    });
  });

  return map;
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
  plotFactoriesMap,
  prices,
  context,
  inputSupplyMode,
  useMastery,
  simulationMode = 'projected',
  isNoAdsActive = false,
}: {
  rows: FactoryDataRow[];
  ownedMap: Map<string, number>;
  plotFactoriesMap?: Map<string, PlotFactoryInstanceDetail>;
  prices: Record<string, number>;
  context: ProfitabilityContext;
  inputSupplyMode: InputSupplyMode;
  useMastery: boolean;
  simulationMode?: SimulationMode;
  isNoAdsActive?: boolean;
}): FactorySummary[] {
  let uniqueTokens = Array.from(new Set(rows.map((r) => r.token)));

  // If in 'active_owned' mode, only include tokens that the user actually owns on their plots!
  if (simulationMode === 'active_owned') {
    uniqueTokens = uniqueTokens.filter((token) => ownedMap.has(token.toUpperCase()));
  }

  return uniqueTokens.map((token) => {
    const tokenRows = rows
      .filter((r) => r.token === token)
      .sort((a, b) => a.level - b.level);
    const ownedLevel = ownedMap.get(token.toUpperCase());

    let targetLevel = 1;
    let facContext: ProfitabilityContext = { ...context };
    const modifiers: ModifierBadgeInfo[] = [];

    if (simulationMode === 'base') {
      // Base mode: level 1 (or base level), 1x speed, 0 mastery, 0 workshop
      targetLevel = 1;
      facContext = {
        workshop: [],
        proficiencies: [],
        activeBoosts: [],
        manualBoostMultiplier: 1,
        workersPercent: 0,
      };
      modifiers.push({
        type: 'workshop',
        label: 'Base 1x',
        detail: 'Catálogo puro sin bonos',
      });
    } else if (simulationMode === 'active_owned') {
      // Active owned: exact player level, exact plot boosters and workers
      targetLevel = ownedLevel || 1;
      const plotDetail = plotFactoriesMap?.get(token.toUpperCase());

      const boostMult = calculateBoosterMultiplier(plotDetail?.boosters || [], isNoAdsActive);
      const manualBoost = boostMult > 0 ? 1 / boostMult : 1;
      const workerRed = calculateWorkerReductionFactor(
        plotDetail?.craftingReduction,
        plotDetail?.workerBoostIntervals,
      );
      const workersPct = (1 - workerRed) * 100;

      facContext = {
        workshop: context.workshop,
        proficiencies: context.proficiencies,
        activeBoosts: [],
        manualBoostMultiplier: manualBoost,
        workersPercent: workersPct,
      };

      if (manualBoost > 1.01) {
        modifiers.push({
          type: 'booster',
          label: `⚡ Booster ${manualBoost.toFixed(1)}x`,
          detail: 'Acelerador de parcela',
        });
      }
      if (workersPct > 0.01) {
        modifiers.push({
          type: 'worker',
          label: `👷 Trabajadores (-${workersPct.toFixed(1)}%)`,
          detail: 'Reducción de tiempo',
        });
      }
      const workshopSpeed = getWorkshopSpeedBoostPercent(token, context.workshop || []);
      if (workshopSpeed > 0) {
        modifiers.push({
          type: 'workshop',
          label: `🛠️ Taller (+${workshopSpeed}%)`,
          detail: 'Mejora de taller',
        });
      }
      const masteryRed = getMasteryInputReductionPercent(token, context.proficiencies || []);
      if (masteryRed > 0 && useMastery) {
        modifiers.push({
          type: 'mastery',
          label: `🎓 Maestría (-${masteryRed}%)`,
          detail: 'Reducción de insumos',
        });
      }
    } else {
      // Projected mode: all factories with player's global perks
      targetLevel = ownedLevel || 1;
      facContext = { ...context };

      if ((facContext.manualBoostMultiplier || 1) > 1.01) {
        modifiers.push({
          type: 'booster',
          label: `⚡ Booster ${(facContext.manualBoostMultiplier || 1).toFixed(1)}x`,
          detail: 'Booster proyectado',
        });
      }
      const workshopSpeed = getWorkshopSpeedBoostPercent(token, context.workshop || []);
      if (workshopSpeed > 0) {
        modifiers.push({
          type: 'workshop',
          label: `🛠️ Taller (+${workshopSpeed}%)`,
          detail: 'Velocidad de taller',
        });
      }
      const masteryRed = getMasteryInputReductionPercent(token, context.proficiencies || []);
      if (masteryRed > 0 && useMastery) {
        modifiers.push({
          type: 'mastery',
          label: `🎓 Maestría (-${masteryRed}%)`,
          detail: 'Ahorro de insumos',
        });
      }
    }

    const activeRow =
      tokenRows.find((r) => r.level === targetLevel) || tokenRows[0];
    const cycle = getAdjustedCycle({
      row: activeRow,
      prices,
      context: facContext,
      inputSupplyMode,
      allRows: rows,
      useMastery: simulationMode === 'base' ? false : useMastery,
    });

    return {
      token,
      ownedLevel: ownedLevel || null,
      activeRow,
      cycle,
      allRows: tokenRows,
      modifiers,
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
