export interface BaseResourceDecomposition {
  earth: number;
  water: number;
  fire: number;
  dust: number;
  lumber: number;
  powerPerUnit: number;
}

export interface FactoryIngredient {
  symbol: string;
  amount: number;
}

export interface FactoryLevelConfig {
  level: number;
  output: number;
  durationSeconds: number;
  powerCost: number;
  productionPerDay: number;
  input1?: FactoryIngredient | null;
  input2?: FactoryIngredient | null;
  upgradeCost?: FactoryIngredient | null;
}

export interface ResourceMetaItem {
  name: string;
  element: 'earth' | 'water' | 'fire' | 'special';
  tier: number;
  icon: string;
  contractAddress?: string;
}

export type CategoryKey =
  | 'all'
  | 'earth'
  | 'water'
  | 'fire'
  | 'special'
  | 'keys'
  | 'nests'
  | 'wraps'
  | 'academy'
  | 'construction';

export interface BaseCostCategory {
  id: CategoryKey;
  labelEn: string;
  labelEs: string;
  color: string;
  textColor: string;
  bgBadge: string;
  borderColor: string;
  resources: string[];
}

export interface BaseCostSettings {
  buySlippage: boolean;
  buySlippagePct: number;
  sellSlippage: boolean;
  sellSlippagePct: number;
  powerPricePer100k: number;
}

export type OptimalStrategy =
  | 'buy_market'
  | 'craft_direct'
  | 'craft_hybrid'
  | 'craft_base';

export interface DirectInputDetail {
  symbol: string;
  name: string;
  amountPerUnit: number;
  marketPrice: number;
  totalMarketCost: number;
  cheapestCraftCost: number;
  bestAction: 'buy' | 'craft';
  savingsPct: number;
}

export interface BaseCostRowData {
  token: string;
  name: string;
  element: string;
  category: string;
  tier: number;
  iconUrl: string;
  poolUrl: string | null;
  curLevel: number;
  maxLevel: number;
  mastery: number;
  // Raw elemental inputs
  earth: number;
  water: number;
  fire: number;
  dust: number;
  lumber: number;
  powerPerUnit: number;
  // Financial metrics in COIN
  baseCost: number;
  powerCoin: number;
  totalCost: number;
  sellPrice: number;
  profit: number;
  marginPct: number | null;

  // Make vs Buy & Smart Routing
  isRootResource: boolean;
  marketBuyPrice: number;
  directInputs: DirectInputDetail[];
  directCraftCost: number;
  baseElementalCraftCost: number;
  hybridCraftCost: number;
  cheapestCost: number;
  bestStrategy: OptimalStrategy;
  savingsPct: number;
  isCraftCheaper: boolean;
}

export interface BaseCostSummaryStats {
  totalTracked: number;
  profitableCount: number;
  unprofitableCount: number;
  avgMarginPct: number;
  bestProfitItem: {
    token: string;
    name: string;
    profit: number;
    marginPct: number;
  } | null;
  worstProfitItem: {
    token: string;
    name: string;
    profit: number;
    marginPct: number;
  } | null;
  elementalPrices: {
    earth: number;
    water: number;
    fire: number;
    dust: number;
    lumber: number;
  };
}
