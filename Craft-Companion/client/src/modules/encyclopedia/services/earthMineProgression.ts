import { LevelProgression } from '../types';
import { formatDuration, formatDurationDiff } from '../utils/formatters';

interface EarthLevelDef {
  level: number;
  costToken: string;
  costAmount: number;
  durationSec: number;
  output: number;
  power: number;
}

const RAW_EARTH_MINE: EarthLevelDef[] = [
  { level: 1, costToken: '', costAmount: 0, durationSec: 15, output: 5, power: 0 },
  { level: 2, costToken: 'Earth', costAmount: 4, durationSec: 15, output: 10, power: 0 },
  { level: 3, costToken: 'Earth', costAmount: 8, durationSec: 15, output: 15, power: 0 },
  { level: 4, costToken: 'Earth', costAmount: 12, durationSec: 31.3, output: 40, power: 0 },
  { level: 5, costToken: 'Earth', costAmount: 20, durationSec: 60, output: 90, power: 0 },
  { level: 6, costToken: 'Mud', costAmount: 3, durationSec: 120, output: 216, power: 0 },
  { level: 7, costToken: 'Sand', costAmount: 1, durationSec: 300, output: 625, power: 0 },
  { level: 8, costToken: 'Sand', costAmount: 3, durationSec: 3600, output: 9000, power: 1 },
  { level: 9, costToken: 'Sand', costAmount: 7, durationSec: 3600, output: 11000, power: 2 },
  { level: 10, costToken: 'Sand', costAmount: 15, durationSec: 3600, output: 13000, power: 2 },
  { level: 11, costToken: 'Sand', costAmount: 25, durationSec: 3600, output: 15000, power: 2 },
  { level: 12, costToken: 'Sand', costAmount: 40, durationSec: 4500, output: 18750, power: 3 },
  { level: 13, costToken: 'Sand', costAmount: 60, durationSec: 5400, output: 22500, power: 3 },
  { level: 14, costToken: 'Copper', costAmount: 3, durationSec: 6000, output: 25000, power: 3 },
  { level: 15, costToken: 'Copper', costAmount: 7, durationSec: 6600, output: 27500, power: 4 },
  { level: 16, costToken: 'Copper', costAmount: 12, durationSec: 7200, output: 30000, power: 4 },
  { level: 17, costToken: 'Copper', costAmount: 20, durationSec: 7680, output: 32000, power: 4 },
  { level: 18, costToken: 'Copper', costAmount: 29, durationSec: 8160, output: 34000, power: 4 },
  { level: 19, costToken: 'Copper', costAmount: 39, durationSec: 8640, output: 36000, power: 4 },
  { level: 20, costToken: 'Copper', costAmount: 51, durationSec: 9000, output: 37500, power: 5 },
  { level: 21, costToken: 'Copper', costAmount: 65, durationSec: 9360, output: 39000, power: 5 },
  { level: 22, costToken: 'Copper', costAmount: 80, durationSec: 9720, output: 40500, power: 5 },
  { level: 23, costToken: 'Copper', costAmount: 96, durationSec: 10080, output: 42000, power: 5 },
  { level: 24, costToken: 'Copper', costAmount: 114, durationSec: 10440, output: 43500, power: 5 },
  { level: 25, costToken: 'Steel', costAmount: 20, durationSec: 10800, output: 45000, power: 6 },
  { level: 26, costToken: 'Steel', costAmount: 28, durationSec: 11100, output: 46250, power: 6 },
  { level: 27, costToken: 'Steel', costAmount: 37, durationSec: 11400, output: 47500, power: 6 },
  { level: 28, costToken: 'Steel', costAmount: 48, durationSec: 11700, output: 48750, power: 6 },
  { level: 29, costToken: 'Steel', costAmount: 56, durationSec: 11940, output: 49750, power: 6 },
  { level: 30, costToken: 'Steel', costAmount: 65, durationSec: 12120, output: 50500, power: 6 },
  { level: 31, costToken: 'Steel', costAmount: 75, durationSec: 12300, output: 51250, power: 6 },
  { level: 32, costToken: 'Steel', costAmount: 88, durationSec: 12480, output: 52000, power: 6 },
  { level: 33, costToken: 'Steel', costAmount: 102, durationSec: 12660, output: 52750, power: 6 },
  { level: 34, costToken: 'Screws', costAmount: 39, durationSec: 12840, output: 53500, power: 6 },
  { level: 35, costToken: 'Screws', costAmount: 45, durationSec: 13020, output: 54250, power: 7 },
  { level: 36, costToken: 'Screws', costAmount: 52, durationSec: 13200, output: 55000, power: 7 },
  { level: 37, costToken: 'Screws', costAmount: 61, durationSec: 13320, output: 55500, power: 7 },
  { level: 38, costToken: 'Screws', costAmount: 70, durationSec: 13440, output: 56000, power: 7 },
  { level: 39, costToken: 'Screws', costAmount: 80, durationSec: 13560, output: 56500, power: 7 },
  { level: 40, costToken: 'Screws', costAmount: 93, durationSec: 13680, output: 57000, power: 7 },
  { level: 41, costToken: 'Screws', costAmount: 107, durationSec: 13800, output: 57500, power: 7 },
  { level: 42, costToken: 'Screws', costAmount: 123, durationSec: 13890, output: 57875, power: 7 },
  { level: 43, costToken: 'Screws', costAmount: 141, durationSec: 13980, output: 58250, power: 7 },
  { level: 44, costToken: 'Screws', costAmount: 162, durationSec: 14040, output: 58500, power: 7 },
  { level: 45, costToken: 'Screws', costAmount: 186, durationSec: 14100, output: 58750, power: 7 },
  { level: 46, costToken: 'Screws', costAmount: 213, durationSec: 14160, output: 59000, power: 7 },
  { level: 47, costToken: 'Dynamite', costAmount: 35, durationSec: 14220, output: 59250, power: 7 },
  { level: 48, costToken: 'Dynamite', costAmount: 40, durationSec: 14280, output: 59500, power: 7 },
  { level: 49, costToken: 'Dynamite', costAmount: 45, durationSec: 14340, output: 59750, power: 7 },
  { level: 50, costToken: 'Dynamite', costAmount: 52, durationSec: 14400, output: 60000, power: 7 },
];

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
