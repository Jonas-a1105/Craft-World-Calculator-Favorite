export type OpportunityType = 'DIP_BUY' | 'SPIKE_SELL' | 'CRAFT_ARBITRAGE' | 'WATCHLIST_HIT';

export type OpportunityTier = 'S' | 'A' | 'B';

export interface ArbitrageIngredient {
  symbol: string;
  qtyNeeded: number;
  marketPriceCoin: number;
  totalCostCoin: number;
}

export interface TradingOpportunity {
  id: string;
  symbol: string;
  name: string;
  type: OpportunityType;
  score: number; // 0 - 100
  tier: OpportunityTier;
  currentPrice: number;
  referencePrice: number; // Moving average or historical anchor
  priceDeltaPercent: number; // e.g. -12.4% (dip) or +18.2% (spike)
  potentialMarginPercent: number; // Net estimated profit %
  potentialProfitCoin: number; // Estimated profit per standard batch (100 units or cycle)
  volume24h?: number;
  reason: string;
  actionRecommendation: string;
  ingredients?: ArbitrageIngredient[];
  cycleTimeMinutes?: number;
  timestamp: number;
}

export interface WatchlistRule {
  id: string;
  symbol: string;
  condition: 'BELOW' | 'ABOVE' | 'MARGIN_ABOVE';
  targetValue: number;
  notes?: string;
  enabled: boolean;
  createdAt: number;
  lastTriggeredAt?: number;
}

export interface TradingBotConfig {
  autoScanIntervalSec: number;
  minScoreThreshold: number;
  discordWebhookUrl: string;
  discordAlertsEnabled: boolean;
  browserNotificationsEnabled: boolean;
  soundAlertsEnabled: boolean;
}

export interface TradingBotStats {
  activeOpportunities: number;
  topProfitPercent: number;
  estimated24hYieldCoin: number;
  signalsTriggeredToday: number;
  botStatus: 'SCANNING' | 'IDLE';
  lastScannedAt: number;
}

export type OpportunityFilter = 'ALL' | 'DIP_BUY' | 'SPIKE_SELL' | 'CRAFT_ARBITRAGE' | 'WATCHLIST_HIT';
