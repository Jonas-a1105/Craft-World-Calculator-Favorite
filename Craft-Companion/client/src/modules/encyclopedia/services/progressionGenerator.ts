import { CatalogItem, LevelProgression, SummaryStats } from '../types';
import { getEarthMineProgression } from './earthMineProgression';
import { formatDuration, formatDurationDiff } from '../utils/formatters';
import { loadFactoryData } from '../../../services/factoryData';

function buildDiffsAndFlags(rawLevels: Array<{
  level: number;
  costToken: string;
  costAmount: number;
  durationSec: number;
  outputAmount: number;
  power: number;
  input1Token?: string;
  input1Amount?: number;
  input2Token?: string;
  input2Amount?: number;
}>): LevelProgression[] {
  let prevRow: LevelProgression | null = null;
  let prevCostToken = '';

  return rawLevels.map((item, index) => {
    const prodPerDay = item.durationSec > 0
      ? Math.round((item.outputAmount / (item.durationSec / 3600)) * 24)
      : 0;

    const isMaterialSwitch =
      index > 0 &&
      Boolean(item.costToken) &&
      Boolean(prevCostToken) &&
      item.costToken.toUpperCase() !== prevCostToken.toUpperCase();

    if (item.costToken) {
      prevCostToken = item.costToken;
    }

    const durationDiff = prevRow ? item.durationSec - prevRow.durationSeconds : 0;
    const outputDiff = prevRow ? item.outputAmount - prevRow.outputAmount : 0;
    const powerDiff = prevRow ? item.power - prevRow.power : 0;
    const prodPerDayDiff = prevRow ? prodPerDay - prevRow.prodPerDay : 0;

    const row: LevelProgression = {
      level: item.level,
      upgradeCostToken: item.costToken,
      upgradeCostAmount: item.costAmount,
      upgradeCostDiff: prevRow ? item.costAmount - prevRow.upgradeCostAmount : 0,
      isMaterialSwitch,
      durationSeconds: item.durationSec,
      durationFormatted: formatDuration(item.durationSec),
      durationDiffFormatted: durationDiff > 0 ? formatDurationDiff(durationDiff) : undefined,
      outputAmount: item.outputAmount,
      outputDiff: outputDiff > 0 ? outputDiff : undefined,
      power: item.power,
      powerDiff: powerDiff > 0 ? powerDiff : undefined,
      prodPerDay,
      prodPerDayDiff: prodPerDayDiff > 0 ? prodPerDayDiff : undefined,
      input1Token: item.input1Token,
      input1Amount: item.input1Amount,
      input2Token: item.input2Token,
      input2Amount: item.input2Amount,
    };

    prevRow = row;
    return row;
  });
}

function calculatePowerForLevel(level: number, maxLevel: number): number {
  if (level <= 7) return 0;
  if (level <= 8) return 1;
  if (level <= 11) return 2;
  if (level <= 14) return 3;
  if (level <= 19) return 4;
  if (level <= 24) return 5;
  if (level <= 34) return 6;
  return 7;
}

export async function fetchProgressionForItem(item: CatalogItem): Promise<LevelProgression[]> {
  if (item.id === 'EARTH') {
    return getEarthMineProgression();
  }

  const allCsvRows = await loadFactoryData();
  const normalizedToken = item.id.toUpperCase();
  const matched = allCsvRows.filter(
    (r) => r.token.toUpperCase() === normalizedToken || r.output_token.toUpperCase() === normalizedToken,
  );

  if (matched.length > 0) {
    matched.sort((a, b) => a.level - b.level);
    const maxLvl = matched[matched.length - 1].level;

    const raw = matched.map((r) => ({
      level: r.level,
      costToken: r.upgrade_token,
      costAmount: r.upgrade_amount,
      durationSec: Math.max(1, Math.round(r.duration_min * 60)),
      outputAmount: r.output_amount,
      power: calculatePowerForLevel(r.level, maxLvl),
      input1Token: r.input_token_1,
      input1Amount: r.input_amount_1,
      input2Token: r.input_token_2,
      input2Amount: r.input_amount_2,
    }));

    return buildDiffsAndFlags(raw);
  }

  // Fallback for buildings or resources not in factories.csv
  const totalLevels = item.isBuilding ? 30 : 50;
  const upgradeTokens = ['Wood', 'Stone', 'Copper', 'Steel', 'Screws', 'Plastics', 'Dynamite'];
  const rawFallback = Array.from({ length: totalLevels }, (_, i) => {
    const lvl = i + 1;
    const tier = Math.min(upgradeTokens.length - 1, Math.floor((lvl - 1) / 7));
    const token = upgradeTokens[tier];
    const amount = Math.round(lvl * 3.5 * Math.pow(1.08, lvl / 5));
    const durationSec = Math.round(15 * Math.pow(1.15, Math.min(lvl, 35)));
    const output = Math.round(10 * Math.pow(1.18, lvl));
    const power = calculatePowerForLevel(lvl, totalLevels);

    return {
      level: lvl,
      costToken: lvl === 1 ? '' : token,
      costAmount: lvl === 1 ? 0 : amount,
      durationSec,
      outputAmount: output,
      power,
    };
  });

  return buildDiffsAndFlags(rawFallback);
}

export function computeSummaryStats(levels: LevelProgression[]): SummaryStats {
  if (levels.length === 0) {
    return {
      maxLevel: 0,
      prodPerDayAtMax: 0,
      powerAtMax: 0,
      cycleDurationAtMaxSeconds: 0,
    };
  }

  const last = levels[levels.length - 1];
  return {
    maxLevel: levels.length,
    prodPerDayAtMax: last.prodPerDay,
    powerAtMax: last.power,
    cycleDurationAtMaxSeconds: last.durationSeconds,
  };
}
