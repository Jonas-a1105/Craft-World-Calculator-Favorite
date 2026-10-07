export type ResourceMarketDelta = {
  percentStr: string;
  isUp: boolean;
};

export interface CategoryFilterConfig {
  id: string;
  label: string;
  icon?: string;
  tokens: string[];
}

export interface ValuedInventoryItem {
  symbol: string;
  amount: number;
  unitPrice: number;
  totalValue: number;
  recommendation: string;
  delta: ResourceMarketDelta;
}

export interface ValuedInventoryResult {
  valuedItems: ValuedInventoryItem[];
  totalValue: number;
}
