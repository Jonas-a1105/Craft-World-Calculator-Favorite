import { LevelProgression } from '../types';
import { formatDuration, formatDurationDiff } from '../utils/formatters';
import { RAW_EARTH_MINE, type EarthLevelDef } from '../data/earthMineProgressionData.generated';

export type { EarthLevelDef };
export { RAW_EARTH_MINE };

export function getEarthMineProgression(): LevelProgression[] {
  let prevRow: LevelProgression | null = null;
  let prevCostToken = '';

  return RAW_EARTH_MINE.map((item, index) => {
    const prodPerDay = Math.round((item.output / (item.durationSec / 3600)) * 24);
    const isMaterialSwitch =
      index > 0 &&
      Boolean(item.costToken) &&
      Boolean(prevCostToken) &&
      item.costToken.toLowerCase() !== prevCostToken.toLowerCase();

    if (item.costToken) {
      prevCostToken = item.costToken;
    }

    const durationDiff = prevRow ? item.durationSec - prevRow.durationSeconds : 0;
    const outputDiff = prevRow ? item.output - prevRow.outputAmount : 0;
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
      outputAmount: item.output,
      outputDiff: outputDiff > 0 ? outputDiff : undefined,
      power: item.power,
      powerDiff: powerDiff > 0 ? powerDiff : undefined,
      prodPerDay,
      prodPerDayDiff: prodPerDayDiff > 0 ? prodPerDayDiff : undefined,
    };

    prevRow = row;
    return row;
  });
}
