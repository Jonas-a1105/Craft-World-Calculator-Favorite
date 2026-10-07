export interface CraftingStepInput {
  token: string;
  amount: number;
}

export interface CraftingStep {
  outputToken: string;
  outputAmount: number;
  factoryName: string;
  factoryDurationMin: number;
  cyclesNeeded: number;
  totalTimeMin: number;
  inputs: CraftingStepInput[];
}

export type PlannerViewTab = 'materials' | 'steps';

export type MaterialFilter = 'all' | 'missing' | 'ready';

export interface PlannerKpiStats {
  totalTypes: number;
  readyTypes: number;
  missingTypes: number;
  totalMissingItems: number;
  totalMissingCost: number;
  completionPercent: number;
  canCraftInstantly: boolean;
}

export interface MaterialEntry {
  symbol: string;
  requiredQty: number;
  currentStock: number;
  missing: number;
  percentCovered: number;
  unitPrice: number;
  costOfMissing: number;
}

export interface UseResourcePlannerReturn {
  loading: boolean;
  targetToken: string;
  setTargetToken: (token: string) => void;
  targetAmount: number;
  setTargetAmount: (amount: number | ((prev: number) => number)) => void;
  tokenOptions: Array<{ value: string; label: string; icon: React.ReactNode }>;
  userResources: Record<string, number>;
  kpiStats: PlannerKpiStats;
  viewTab: PlannerViewTab;
  setViewTab: (tab: PlannerViewTab) => void;
  materialFilter: MaterialFilter;
  setMaterialFilter: (filter: MaterialFilter) => void;
  craftingSteps: CraftingStep[];
  filteredMaterialEntries: MaterialEntry[];
  copiedNotification: boolean;
  handleCopyMissing: () => void;
}
