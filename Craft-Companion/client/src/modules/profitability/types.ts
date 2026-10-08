import type { FactoryDataRow } from '../../services/factoryData';
import type { FactoryCycleResult } from '../../services/craftworldCalculations';
import type { ValueChainAnalysis } from '../../services/valueChainCalculator';

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

import type { WorkshopItem } from '../../services/workshopModifiers';
import type { ProficiencyItem } from '../../services/masteryModifiers';

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
