import type { ReactNode } from 'react';

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

export type MaterialFilter =
  | 'all'
  | 'sell_buy'
  | 'convert'
  | 'missing'
  | 'ready'
  | 'craft'
  | 'buy';

export interface PlannerKpiStats {
  totalTypes: number;
  readyTypes: number;
  missingTypes: number;
  totalMissingItems: number;
  totalMissingCost: number;
  completionPercent: number;
  canCraftInstantly: boolean;
  targetUnitPrice: number;
  marketBuyTotalCost: number;
  savingsVsMarket: number;
  savingsPercent: number;
  isCraftingCheaper: boolean;
  sellBuyStepsCount: number;
  convertStepsCount: number;
  totalArbitrageProfit: number;
}

export interface DirectInputRequirement {
  token: string;
  amountPerUnit: number;
  totalAmount: number;
  unitPrice: number;
}

export type TacticalStepAction =
  | 'sell_input_buy_next'
  | 'convert_in_factory'
  | 'base_harvest'
  | 'final_target';

export interface MaterialEntry {
  symbol: string;
  stageIndex: number;
  depth: number;
  isTarget: boolean;
  isRawElement: boolean;
  isCraftable: boolean;
  factoryName?: string;
  requiredQty: number;
  currentStock: number;
  missing: number;
  percentCovered: number;
  unitPrice: number;
  costOfMissing: number;

  // Chain Arbitrage (Vender Insumo vs Convertir en Fábrica)
  tacticalAction: TacticalStepAction;
  inputSymbol?: string;
  inputRequiredQty?: number;
  inputUnitPrice?: number;
  inputSellRevenue?: number;
  targetBuyCost?: number;
  arbitrageDelta: number;
  arbitrageBenefitPercent: number;

  // General metrics
  craftCostPerUnit: number;
  totalCraftCost: number;
  recommendedAction: 'buy' | 'craft';
  savingsPerUnit: number;
  savingsPercent: number;
  isCraftCheaper: boolean;
  directInputs: DirectInputRequirement[];
}

export interface UseResourcePlannerReturn {
  loading: boolean;
  targetToken: string;
  setTargetToken: (token: string) => void;
  targetAmount: number;
  setTargetAmount: (amount: number | ((prev: number) => number)) => void;
  tokenOptions: Array<{ value: string; label: string; icon: ReactNode }>;
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
