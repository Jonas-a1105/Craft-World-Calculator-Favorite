import { CatalogItem, LevelProgression, SummaryStats } from '../types';
import { formatDuration, formatDurationDiff } from '../utils/formatters';
import { loadFactoryData } from '../../../services/factoryData';
import { loadBuildingData } from '../../../services/buildingData';

interface RawProgressionInput {
  level: number;
  costToken: string;
  costAmount: number;
  durationSec: number;
  durationRaw?: string;
  outputAmount: number;
  power: number;
  prodPerDay: number;
  input1Token?: string;
  input1Amount?: number;
  input2Token?: string;
  input2Amount?: number;
  yieldPercent?: number;
  xpPerOutput?: number;
  xpPerDay?: number;
  xpPerBattery?: number;
  productionChange?: number;
  input1DailyConsumption?: number;
  input2DailyConsumption?: number;
  powerPerUnit?: number;
  capacity?: number;
  maxCount?: number;
  requiredTownHallLevel?: number;
  slots?: number;
  residents?: number;
  size?: string;
  trainingTime?: string;
  incubationDiscount?: string;
  talentChances?: Record<string, string>;
  powerRecoveryStep?: string;
  unlockLevel?: number;
}

export function buildDiffsAndFlags(rawLevels: RawProgressionInput[]): LevelProgression[] {
  let prevRow: LevelProgression | null = null;
  let prevCostToken = '';

  return rawLevels.map((item, index) => {
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
    const prodPerDayDiff = prevRow ? item.prodPerDay - prevRow.prodPerDay : 0;

    const row: LevelProgression = {
      level: item.level,
      upgradeCostToken: item.costToken,
      upgradeCostAmount: item.costAmount,
      upgradeCostDiff: prevRow ? item.costAmount - prevRow.upgradeCostAmount : 0,
      isMaterialSwitch,
      durationSeconds: item.durationSec,
      durationFormatted: formatDuration(item.durationSec),
      durationRaw: item.durationRaw,
      durationDiffFormatted: durationDiff > 0 ? formatDurationDiff(durationDiff) : undefined,
      outputAmount: item.outputAmount,
      outputDiff: outputDiff > 0 ? outputDiff : undefined,
      power: item.power,
      powerDiff: powerDiff > 0 ? powerDiff : undefined,
      prodPerDay: item.prodPerDay,
      prodPerDayDiff: prodPerDayDiff > 0 ? prodPerDayDiff : undefined,
      input1Token: item.input1Token,
      input1Amount: item.input1Amount,
      input2Token: item.input2Token,
      input2Amount: item.input2Amount,
      yieldPercent: item.yieldPercent,
      xpPerOutput: item.xpPerOutput,
      xpPerDay: item.xpPerDay,
      xpPerBattery: item.xpPerBattery,
      productionChange: item.productionChange,
      input1DailyConsumption: item.input1DailyConsumption,
      input2DailyConsumption: item.input2DailyConsumption,
      powerPerUnit: item.powerPerUnit,
      capacity: item.capacity,
      maxCount: item.maxCount,
      requiredTownHallLevel: item.requiredTownHallLevel,
      slots: item.slots,
      residents: item.residents,
      size: item.size,
      trainingTime: item.trainingTime,
      incubationDiscount: item.incubationDiscount,
      talentChances: item.talentChances,
      powerRecoveryStep: item.powerRecoveryStep,
      unlockLevel: item.unlockLevel,
    };

    prevRow = row;
    return row;
  });
}

export async function fetchProgressionForItem(item: CatalogItem): Promise<LevelProgression[]> {
  const normalizedToken = item.id.replace(/[_\s-]+/g, '').toUpperCase();

  // 1. If item is a building, load official building progression
  if (item.isBuilding) {
    const buildingsMap = await loadBuildingData();
    const buildingRows =
      buildingsMap[item.id] ||
      buildingsMap[normalizedToken] ||
      buildingsMap[item.iconSymbol.toUpperCase()] ||
      [];

    if (buildingRows.length > 0) {
      const raw: RawProgressionInput[] = buildingRows.map((b) => {
        const durationSec =
          b.cycleDurationSec && b.cycleDurationSec > 0
            ? b.cycleDurationSec
            : b.upgradeDurationSec;
        const durationRaw = b.cycleDurationRaw || b.upgradeDurationRaw;

        return {
          level: b.level,
          costToken: b.costToken || '',
          costAmount: b.costAmount || 0,
          durationSec,
          durationRaw,
          outputAmount: b.power || b.residents || b.slots || b.capacity || b.level,
          power: b.power || 0,
          prodPerDay: b.prodPerDay || 0,
          input1Token: b.input1Token || '',
          input1Amount: b.input1Amount || 0,
          capacity: b.capacity,
          maxCount: b.maxCount,
          requiredTownHallLevel: b.requiredTownHallLevel || b.townHallLevel,
          slots: b.slots,
          residents: b.residents,
          size: b.size,
          trainingTime: b.trainingTime,
          incubationDiscount: b.incubationDiscount,
          talentChances: b.talentChances,
          powerRecoveryStep: b.powerRecoveryStep,
          unlockLevel: b.unlockLevel,
        };
      });

      return buildDiffsAndFlags(raw);
    }
  }

  // 2. Industrial factory progression
  const allRows = await loadFactoryData();
  const matched = allRows.filter(
    (r) =>
      r.token.replace(/[_\s-]+/g, '').toUpperCase() === normalizedToken ||
      r.output_token.replace(/[_\s-]+/g, '').toUpperCase() === normalizedToken,
  );

  if (matched.length > 0) {
    matched.sort((a, b) => a.level - b.level);

    const raw: RawProgressionInput[] = matched.map((r) => {
      let durationSec = 0;
      if (r.duration_min && r.duration_min > 0) {
        durationSec = Math.round(r.duration_min * 60);
      } else if (r.daily_production && r.daily_production > 0 && r.output_amount > 0) {
        durationSec = Math.round((r.output_amount / r.daily_production) * 86400);
      } else {
        durationSec = 15;
      }

      const prodPerDay =
        r.daily_production && r.daily_production > 0
          ? r.daily_production
          : durationSec > 0
            ? Math.round((r.output_amount / (durationSec / 3600)) * 24)
            : 0;

      return {
        level: r.level,
        costToken: r.upgrade_token || '',
        costAmount: r.upgrade_amount || 0,
        durationSec,
        durationRaw: r.duration_raw,
        outputAmount: r.output_amount,
        power: r.power_cost ?? 0,
        prodPerDay,
        input1Token: r.input_token_1 || '',
        input1Amount: r.input_amount_1 || 0,
        input2Token: r.input_token_2 || '',
        input2Amount: r.input_amount_2 || 0,
        yieldPercent: r.yield_percent,
        xpPerOutput: r.xp_per_output,
        xpPerDay: r.xp_per_day,
        xpPerBattery: r.xp_per_battery,
        productionChange: r.production_change,
        input1DailyConsumption: r.input_1_consumption_per_day,
        input2DailyConsumption: r.input_2_consumption_per_day,
        powerPerUnit: r.power_per_unit,
      };
    });

    return buildDiffsAndFlags(raw);
  }

  return [];
}

export function computeSummaryStats(levels: LevelProgression[]): SummaryStats {
  if (levels.length === 0) {
    return {
      maxLevel: 0,
      prodPerDayAtMax: 0,
      powerAtMax: 0,
      cycleDurationAtMaxSeconds: 0,
      cycleDurationAtMaxFormatted: '—',
      xpPerDayAtMax: 0,
    };
  }

  const last = levels[levels.length - 1];
  const maxLvl = Math.max(...levels.map((l) => l.level));

  return {
    maxLevel: maxLvl,
    prodPerDayAtMax: last.prodPerDay,
    powerAtMax: last.power,
    cycleDurationAtMaxSeconds: last.durationSeconds,
    cycleDurationAtMaxFormatted: last.durationRaw || last.durationFormatted,
    xpPerDayAtMax: last.xpPerDay || 0,
  };
}
