export interface MarketPriceItem {
  referenceSymbol: string;
  amount: number;
  recommendation: string;
}

export interface PriceListData {
  baseSymbol?: string;
  prices?: MarketPriceItem[];
}
