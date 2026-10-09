export interface PassivePlantLevel {
  level: number;
  powerPerCycle: number;
  cycleSec: number;
  maxCount: number;
}

export interface DisabledPlantLevel {
  level: number;
  powerPerCycle: number;
  cycleSec: number;
  inputSymbol: string;
  inputPerCycle: number;
}

export interface PlantState {
  level: number; // 0 = not owned, 1..N = level
  count: number;
}

export interface PowerPackState {
  capacity: number; // in kW, default 8_450_000
  packs25PerDay: number;
  packs50PerDay: number; // 0 or 1
  packs100PerDay: number;
  activateCrystalPass: boolean;
}

export interface CostComparisonRow {
  label: string;
  periodText: string;
  power: number;
  powerText: string;
  crystals: number;
  crystalEquivalentCoin: number | null;
  resourceCostCoin: number;
  coinPer100k: number | null;
  isCheapest: boolean;
  colorHsl: string | null;
}

export interface PowerSimulatorSummary {
  freePowerHourly: number;
  freePowerDaily: number;
  paidPowerDaily: number;
  totalDailyPower: number;
  totalCrystalsDaily: number;
  crystalsCostCoin: number | null;
  crystalPassDiscountCoin: number;
  effectiveTotalCostCoin: number | null;
  effectiveCoinPer100k: number | null;
}
