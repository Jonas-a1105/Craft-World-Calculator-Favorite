import type { InventoryData } from './modules/home/types';

export type Me = {
  id: string;
  craftWorldUid?: string;
  craftWorldDisplayName?: string;
  craftWorldAvatarUrl?: string;
  craftWorldLevel?: number;
  createdAt: string;
  lastLoginAt?: string;
};

export interface CraftworldPriceItem {
  referenceSymbol?: string | null;
  amount?: number;
  recommendation?: string;
}

export interface CraftworldPriceList {
  baseSymbol?: string;
  prices?: CraftworldPriceItem[];
}

export interface CraftworldResourceBalance {
  symbol: string;
  amount: number;
}

export interface CraftworldFactoryBooster {
  boostValue?: number;
  startTime?: string;
  endTime?: string;
}

export interface CraftworldFactoryDefinition {
  id?: string;
  name?: string;
  displayName?: string;
  levels?: Array<{ millisecondsPerCompletion?: number }>;
}

export interface CraftworldCraftingState {
  startedAt?: string;
  pausedAt?: string | null;
  stoppedAt?: string | null;
  isStopped?: boolean;
  currentRunLevel?: number;
  currentTimeReduction?: number;
}

export interface CraftworldFactoryInstance {
  id?: string;
  symbol?: string;
  level?: number;
  definitionId?: string;
  name?: string;
  displayName?: string;
  factory?: {
    id?: string;
    level?: number;
    definitionId?: string;
    definition?: CraftworldFactoryDefinition;
    crafting?: CraftworldCraftingState;
    startedAt?: string;
    pausedAt?: string | null;
    stoppedAt?: string | null;
    isStopped?: boolean;
  };
  definition?: CraftworldFactoryDefinition;
  crafting?: CraftworldCraftingState;
  startedAt?: string;
  pausedAt?: string | null;
  stoppedAt?: string | null;
  isStopped?: boolean;
  boosters?: CraftworldFactoryBooster[];
  consumableBoosters?: CraftworldFactoryBooster[];
  workerBoostIntervals?: Array<{ boostValue?: number }>;
  craftingReduction?: number;
}

export interface CraftworldLandArea {
  id?: string;
  factories?: CraftworldFactoryInstance[];
  booster?: { boostValue?: number };
}

export interface CraftworldLandPlot {
  id?: string;
  name?: string;
  areas?: CraftworldLandArea[];
  booster?: { boostValue?: number };
  appliedBlueprint?: { definitionId?: string; starLevel?: number } | null;
}

export interface CraftworldWorker {
  id?: string;
  name?: string;
  isAreaLead?: boolean;
  areaBoostValue?: number;
  areaUuid?: string;
  boostValue?: number;
}

export interface CraftworldBuilding {
  id?: string;
  type?: string;
  level?: number;
}

export interface CraftworldEgg {
  symbol?: string;
  amount?: number;
}

export type CraftworldExternalProfile = {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
  level?: number;
};

export type CraftworldExternalCraftWorld = {
  level?: number;
  resourceBalances?: CraftworldResourceBalance[];
};

export type CraftworldExternalMasterpieces = {
  claimedMasterpieceIds?: string[];
  activeBattlePasses?: Array<{ id?: string; name?: string; endsAt?: string }>;
};

export interface CraftworldTradeExecution {
  id?: string;
  errorReason?: string | null;
  symbol?: string;
  price?: number;
  amount?: number;
  timestamp?: string;
  trade?: {
    input?: { symbol?: string; amount?: number };
    output?: { symbol?: string; amount?: number };
  };
  quote?: {
    input?: { symbol?: string; amount?: number };
    output?: { symbol?: string; amount?: number };
  };
}

export interface CraftworldHomePayload {
  profile?: {
    uid?: string;
    displayName?: string;
    level?: number;
    avatarUrl?: string;
  };
  craftWorld?: {
    level?: number;
    experiencePoints?: number;
    factories?: CraftworldFactoryInstance[];
    resources?: CraftworldResourceBalance[];
    landPlots?: CraftworldLandPlot[];
    mines?: Array<{ symbol?: string; level?: number }>;
    proficiencies?: Array<{ symbol?: string; token?: string; level?: number; claimedLevel?: number }>;
    dynos?: Array<{ id?: string; symbol?: string; level?: number }>;
    workers?: CraftworldWorker[];
    playerBase?: CraftworldBuilding[];
  };

  masterpieces?: CraftworldExternalMasterpieces;
  inventory?: InventoryData | CraftworldResourceBalance[];
  exchange?: {
    tradeExecutions?: CraftworldTradeExecution[];
  };
  onchain?: {
    wallets?: Array<{ address: string; type?: string; isPrimary?: boolean; label?: string }>;
  };
  purchases?: {
    isNoAdsActive?: boolean;
    shopItemPurchases?: Array<{ shopItemId: string; purchasedAt: string }>;
  };
  priceList?: CraftworldPriceList;
  proficiencies?: Array<{ symbol?: string; level?: number }>;
  craft?: {
    power?: number;
    powerUsed?: number;
    skillPoints?: number;
    vaults?: Array<{ symbol: string; amount: number; capacity: number; isUnlocked?: boolean }>;
    workshop?: Array<{ symbol: string; level: number }>;
    proficiencies?: Array<{ symbol: string; level?: number }>;
  };
  serverTime?: string;
  lastSyncedAt?: string;
}
