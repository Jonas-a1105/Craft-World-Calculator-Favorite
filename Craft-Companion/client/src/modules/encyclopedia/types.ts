export type EncyclopediaCategory = 'resources' | 'buildings';

export interface CatalogItem {
  id: string;
  name: string;
  nameEs: string;
  category: EncyclopediaCategory;
  badge: string;
  badgeEs: string;
  iconSymbol: string;
  isBuilding?: boolean;
}

export interface LevelProgression {
  level: number;
  upgradeCostToken: string;
  upgradeCostAmount: number;
  upgradeCostDiff?: number;
  isMaterialSwitch: boolean;
  durationSeconds: number;
  durationFormatted: string;
  durationDiffFormatted?: string;
  outputAmount: number;
  outputDiff?: number;
  power: number;
  powerDiff?: number;
  prodPerDay: number;
  prodPerDayDiff?: number;
  input1Token?: string;
  input1Amount?: number;
  input2Token?: string;
  input2Amount?: number;
}

export interface SummaryStats {
  maxLevel: number;
  prodPerDayAtMax: number;
  powerAtMax: number;
  cycleDurationAtMaxSeconds: number;
}

export type TableViewMode = 'essential' | 'all';
