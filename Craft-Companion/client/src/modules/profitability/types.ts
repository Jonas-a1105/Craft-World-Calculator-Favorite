import type { FactoryDataRow } from '../../services/factoryData';
import type { FactoryCycleResult } from '../../services/craftworldCalculations';
import type { ValueChainAnalysis } from '../../services/valueChainCalculator';
import type { WorkshopItem } from '../../services/workshopModifiers';
import type { ProficiencyItem } from '../../services/masteryModifiers';

export type FilterMode = 'all' | 'owned' | 'profitable' | 'loss';

export type SortByOption =
  | 'profit_hour'
  | 'profit_day'
  | 'xp_hour'
  | 'margin'
  | 'alphabetical';

export type InputSupplyMode = 'market' | 'self_crafted';

export type ModalViewTab = 'levels' | 'chain';

export interface AdjustedCycleResult extends FactoryCycleResult {
  effectiveInputCost: number;
  effectiveProfitPerCycle: number;
  effectiveProfitPerHour: number;
  effectiveProfitPerDay: number;
  rawBaseMaterialsText?: string;
}

export type SimulationMode = 'base' | 'active_owned' | 'projected';

export interface ModifierBadgeInfo {
  type: 'booster' | 'worker' | 'workshop' | 'mastery';
  label: string;
  detail: string;
}

export interface FactorySummary {
  token: string;
  ownedLevel: number | null;
  activeRow: FactoryDataRow;
  cycle: AdjustedCycleResult;
  allRows: FactoryDataRow[];
  modifiers?: ModifierBadgeInfo[];
}

export interface ProfitabilityContext {
  workshop: WorkshopItem[];
  proficiencies: ProficiencyItem[];
  activeBoosts: Array<{ boostValue: number }>;
  manualBoostMultiplier?: number;
  workersPercent?: number;
}

export interface UseProfitabilityReturn {
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => void;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  sortBy: SortByOption;
  setSortBy: (sort: SortByOption) => void;
  useWorkshop: boolean;
  setUseWorkshop: (val: boolean) => void;
  useMastery: boolean;
  setUseMastery: (val: boolean) => void;
  useBoosters: boolean;
  setUseBoosters: (val: boolean) => void;
  inputSupplyMode: InputSupplyMode;
  setInputSupplyMode: (mode: InputSupplyMode) => void;
  selectedTokenModal: string | null;
  setSelectedTokenModal: (token: string | null) => void;
  modalViewTab: ModalViewTab;
  setModalViewTab: (tab: ModalViewTab) => void;
  modalLevelFilter: FilterMode;
  setModalLevelFilter: (mode: FilterMode) => void;
  filteredSummaries: FactorySummary[];
  uniqueTokensCount: number;
  ownedCount: number;
  modalSummary: FactorySummary | undefined;
  modalCycleResults: AdjustedCycleResult[];
  modalChainAnalysis: ValueChainAnalysis | null;
}

// -------------------------------------------------------------
// Unified High-Density "Prices & Profitability" Types
// -------------------------------------------------------------

export type TableCategory =
  | 'all'
  | 'earth'
  | 'water'
  | 'fire'
  | 'special'
  | 'favorites'
  | 'active';

export type TableSortField =
  | 'resource'
  | 'price'
  | 'change1h'
  | 'change24h'
  | 'count'
  | 'level'
  | 'mastery'
  | 'power'
  | 'profit';

export type SortDirection = 'asc' | 'desc';

export type BoostOption = 'None' | 'x2';

export interface FactoryRowConfig {
  count: number;
  level: number;
  masteryLevel: number;
  workerPercent: number;
  workshopPercent: number;
  boost: BoostOption;
}

export interface FactoryTableRow {
  token: string;
  name: string;
  category: string;
  priceCoin: number;
  priceUsd: number;
  change1h: number;
  change24h: number;

  // Editable simulation configuration
  count: number;
  level: number;
  maxLevel: number;
  masteryLevel: number;
  masteryReductionPercent: number;
  workerPercent: number;
  workshopPercent: number;
  boost: BoostOption;

  // Real account baseline (to know if customized & for 1-click restore)
  accountCount: number;
  accountLevel: number;
  accountMasteryLevel: number;
  accountWorkerPercent: number;
  accountWorkshopPercent: number;
  accountBoost: BoostOption;
  isOwned: boolean;
  isModified: boolean;

  // Computed hourly & cycle metrics
  powerKwPerHour: number;
  powerCostCoinPerHour: number;
  profitPerHour: number;
  profitPerDay: number;
  runsPerHour: number;
  outputPerHour: number;
  grossRevenuePerHour: number;
  inputCostPerHour: number;
  marginPercent: number | null;

  // References for drill-down modal
  activeRow: FactoryDataRow;
  allRows: FactoryDataRow[];
}

export interface GlobalProfitabilitySettings {
  adBoost2x: boolean;
  buySlippage: boolean;
  sellSlippage: boolean;
  powerPriceCoin: number; // e.g. 0 COIN / 100k Power
  inputSupplyMode: InputSupplyMode;
}

export interface ProfitabilitySummaryTotals {
  totalProfitPerHour: number;
  totalProfitPerDay: number;
  totalPowerKwPerHour: number;
  totalPowerCostPerHour: number;
  totalActiveFactories: number;
  totalActiveTokens: number;
  coinUsdPrice: number;
  coin1hChange: number;
  coin24hChange: number;
}
