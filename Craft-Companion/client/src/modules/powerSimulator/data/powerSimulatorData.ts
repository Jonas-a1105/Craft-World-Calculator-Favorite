import type { PassivePlantLevel, DisabledPlantLevel } from '../types';

export const CRYSTAL_PRICE_USD = 79.99 / 14_000;
export const CRYSTAL_PRICE_USD_SUB = 14.99 / 4_500;
export const DEFAULT_MAX_CAPACITY = 8_450_000;
export const MAX_DAILY_SUB_CRYSTALS = 150;

export const AIRSTREAM_LEVELS: PassivePlantLevel[] = [
  { level: 1, powerPerCycle: 10, cycleSec: 300, maxCount: 1 },
  { level: 2, powerPerCycle: 40, cycleSec: 300, maxCount: 1 },
  { level: 3, powerPerCycle: 63, cycleSec: 300, maxCount: 2 },
  { level: 4, powerPerCycle: 80, cycleSec: 300, maxCount: 2 },
  { level: 5, powerPerCycle: 95, cycleSec: 300, maxCount: 3 },
  { level: 6, powerPerCycle: 108, cycleSec: 300, maxCount: 3 },
  { level: 7, powerPerCycle: 135, cycleSec: 300, maxCount: 3 },
  { level: 8, powerPerCycle: 175, cycleSec: 300, maxCount: 3 },
  { level: 9, powerPerCycle: 215, cycleSec: 300, maxCount: 4 },
  { level: 10, powerPerCycle: 275, cycleSec: 300, maxCount: 5 },
  { level: 11, powerPerCycle: 360, cycleSec: 300, maxCount: 6 },
  { level: 12, powerPerCycle: 500, cycleSec: 300, maxCount: 7 },
  { level: 13, powerPerCycle: 750, cycleSec: 300, maxCount: 7 },
  { level: 14, powerPerCycle: 1150, cycleSec: 300, maxCount: 8 },
  { level: 15, powerPerCycle: 1700, cycleSec: 300, maxCount: 8 },
];

export const SUNFORGE_LEVELS: PassivePlantLevel[] = [
  { level: 1, powerPerCycle: 7200, cycleSec: 14400, maxCount: 1 },
  { level: 2, powerPerCycle: 12480, cycleSec: 14400, maxCount: 1 },
  { level: 3, powerPerCycle: 24000, cycleSec: 14400, maxCount: 1 },
  { level: 4, powerPerCycle: 34560, cycleSec: 14400, maxCount: 2 },
  { level: 5, powerPerCycle: 48000, cycleSec: 14400, maxCount: 2 },
  { level: 6, powerPerCycle: 67200, cycleSec: 14400, maxCount: 3 },
  { level: 7, powerPerCycle: 100800, cycleSec: 14400, maxCount: 3 },
  { level: 8, powerPerCycle: 151200, cycleSec: 14400, maxCount: 4 },
  { level: 9, powerPerCycle: 226800, cycleSec: 14400, maxCount: 5 },
  { level: 10, powerPerCycle: 336000, cycleSec: 14400, maxCount: 5 },
];

export const STEAMFORGE_LEVELS: DisabledPlantLevel[] = [
  { level: 1, powerPerCycle: 500, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.01429 },
  { level: 2, powerPerCycle: 750, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.02143 },
  { level: 3, powerPerCycle: 1000, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.02857 },
  { level: 4, powerPerCycle: 1300, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.03714 },
  { level: 5, powerPerCycle: 1750, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.05 },
  { level: 6, powerPerCycle: 2200, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.06286 },
  { level: 7, powerPerCycle: 3075, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.08786 },
  { level: 8, powerPerCycle: 4675, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.13357 },
  { level: 9, powerPerCycle: 7175, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.205 },
  { level: 10, powerPerCycle: 10750, cycleSec: 300, inputSymbol: 'LAVA', inputPerCycle: 0.30714 },
];

export const REACTOR_LEVELS: DisabledPlantLevel[] = [
  { level: 1, powerPerCycle: 111000, cycleSec: 3600, inputSymbol: 'HYDROGEN', inputPerCycle: 0.01531 },
  { level: 2, powerPerCycle: 240000, cycleSec: 3600, inputSymbol: 'HYDROGEN', inputPerCycle: 0.0331 },
  { level: 3, powerPerCycle: 390000, cycleSec: 3600, inputSymbol: 'HYDROGEN', inputPerCycle: 0.05379 },
  { level: 4, powerPerCycle: 600000, cycleSec: 3600, inputSymbol: 'HYDROGEN', inputPerCycle: 0.08276 },
  { level: 5, powerPerCycle: 900000, cycleSec: 3600, inputSymbol: 'HYDROGEN', inputPerCycle: 0.12414 },
];
