import type { MarketPriceItem } from '../../prices/types';
import type { FactoryDataRow } from '../../../services/craftworldCalculations';
import type { RoninPoolsDataset } from '../../../services/roninPoolsService';
import { calculatePriceChanges } from '../../profitability/services/pricesAndProfitabilityService';
import { scanCraftArbitrageOpportunities } from './arbitrageEngine';
import type { ProficiencyItem } from '../../../services/masteryModifiers';
import {
  percentChange,
  roundHalfUp,
  sumPrecise,
} from '../../../services/financial/pricingService';
import type {
  TradingOpportunity,
  WatchlistRule,
  TradingBotStats,
  OpportunityFilter,
} from '../types';

export interface GenerateOpportunitiesParams {
  marketPrices: MarketPriceItem[];
  factoryRows?: FactoryDataRow[];
  poolsDataset?: RoninPoolsDataset | null;
  watchlist?: WatchlistRule[];
  proficiencies?: ProficiencyItem[];
}

/**
 * Generates market signals (DIP_BUY, SPIKE_SELL, CRAFT_ARBITRAGE, WATCHLIST_HIT)
 */
export function generateTradingOpportunities({
  marketPrices,
  factoryRows = [],
  poolsDataset,
  watchlist = [],
  proficiencies = [],
}: GenerateOpportunitiesParams): TradingOpportunity[] {
  const opportunities: TradingOpportunity[] = [];

  // Build price map for fast lookup
  const priceMap: Record<string, number> = {};
  marketPrices.forEach((p) => {
    if (p.referenceSymbol && p.amount > 0) {
      priceMap[p.referenceSymbol.toUpperCase()] = p.amount;
    }
  });

  // 1. Scan DIP_BUY and SPIKE_SELL from Market Prices & Historical Pools
  for (const item of marketPrices) {
    if (!item.referenceSymbol || item.amount <= 0) continue;
    const sym = item.referenceSymbol.toUpperCase();

    const { change24h } = calculatePriceChanges(sym, item.amount, poolsDataset);
    const rec = (item.recommendation || '').toUpperCase();

    // Check DIP_BUY condition: Price dropped >= 6% or recommendation is BUY with negative change
    if (change24h <= -6 || (rec === 'BUY' && change24h < 0)) {
      const discount = Math.abs(change24h);
      const estReturn = roundHalfUp(discount * 1.15, 1);
      const score = Math.min(98, Math.max(55, Math.round(55 + discount * 2.2)));
      const tier = score >= 85 ? 'S' : score >= 70 ? 'A' : 'B';

      opportunities.push({
        id: `dip-${sym}`,
        symbol: item.referenceSymbol,
        name: item.referenceSymbol,
        type: 'DIP_BUY',
        score,
        tier,
        currentPrice: item.amount,
        referencePrice: roundHalfUp(item.amount / (1 + change24h / 100), 2),
        priceDeltaPercent: change24h,
        potentialMarginPercent: estReturn,
        potentialProfitCoin: roundHalfUp(item.amount * (estReturn / 100) * 100, 2),
        reason: `Caída de ${change24h.toFixed(1)}% en 24h. Cotiza por debajo de su media histórica.`,
        actionRecommendation: `Comprar en corrección para rebote hacia su precio promedio estimado.`,
        timestamp: Date.now(),
      });
    }

    // Check SPIKE_SELL condition: Price increased >= 9% or recommendation is SELL with positive change
    if (change24h >= 9 || (rec === 'SELL' && change24h > 5)) {
      const score = Math.min(95, Math.max(55, Math.round(55 + change24h * 1.8)));
      const tier = score >= 85 ? 'S' : score >= 70 ? 'A' : 'B';

      opportunities.push({
        id: `spike-${sym}`,
        symbol: item.referenceSymbol,
        name: item.referenceSymbol,
        type: 'SPIKE_SELL',
        score,
        tier,
        currentPrice: item.amount,
        referencePrice: roundHalfUp(item.amount / (1 + change24h / 100), 2),
        priceDeltaPercent: change24h,
        potentialMarginPercent: roundHalfUp(change24h, 1),
        potentialProfitCoin: roundHalfUp(item.amount * (change24h / 100) * 100, 2),
        reason: `Pico alcista de +${change24h.toFixed(1)}% en 24h. Máximo de cotización reciente.`,
        actionRecommendation: `Momento ideal para liquidar inventario excedente y asegurar liquidez COIN.`,
        timestamp: Date.now(),
      });
    }
  }

  // 2. Scan Craft Arbitrage (Make vs Buy)
  if (factoryRows.length > 0) {
    const arbitrageOpps = scanCraftArbitrageOpportunities(factoryRows, priceMap, 15, proficiencies);
    opportunities.push(...arbitrageOpps);
  }

  // 3. Scan User Watchlist Triggers
  for (const rule of watchlist) {
    if (!rule.enabled) continue;
    const currentPrice = priceMap[rule.symbol.toUpperCase()];
    if (!currentPrice) continue;

    let triggered = false;

    if (rule.condition === 'BELOW' && currentPrice <= rule.targetValue) {
      triggered = true;
    } else if (rule.condition === 'ABOVE' && currentPrice >= rule.targetValue) {
      triggered = true;
    }

    if (triggered) {
      // Ambas condiciones comparten la misma fórmula: variación % vs el precio objetivo.
      const delta = percentChange(currentPrice, rule.targetValue) ?? 0;

      opportunities.unshift({
        id: `watch-${rule.id}`,
        symbol: rule.symbol,
        name: rule.symbol,
        type: 'WATCHLIST_HIT',
        score: 99,
        tier: 'S',
        currentPrice,
        referencePrice: rule.targetValue,
        priceDeltaPercent: roundHalfUp(delta, 1),
        potentialMarginPercent: Math.abs(roundHalfUp(delta, 1)),
        potentialProfitCoin: roundHalfUp(Math.abs(currentPrice - rule.targetValue) * 100, 2),
        reason: `Alerta personalizada activada: ${rule.symbol} alcanzó ${currentPrice} COIN (Objetivo: ${rule.targetValue} COIN).`,
        actionRecommendation: rule.notes || `Disparador objetivo alcanzado para ${rule.symbol}.`,
        timestamp: Date.now(),
      });
    }
  }

  // Deduplicate and Sort descending by Score then Potential Profit
  const uniqueMap = new Map<string, TradingOpportunity>();
  for (const opp of opportunities) {
    const existing = uniqueMap.get(opp.symbol + opp.type);
    if (!existing || opp.score > existing.score) {
      uniqueMap.set(opp.symbol + opp.type, opp);
    }
  }

  return Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score || b.potentialMarginPercent - a.potentialMarginPercent);
}

/**
 * Filter opportunities by type and text search
 */
export function filterOpportunities(
  opportunities: TradingOpportunity[],
  filterType: OpportunityFilter,
  searchQuery: string,
): TradingOpportunity[] {
  const q = searchQuery.trim().toLowerCase();

  return opportunities.filter((opp) => {
    // Type filter
    if (filterType !== 'ALL' && opp.type !== filterType) {
      return false;
    }

    // Search query filter
    if (q) {
      const matchSymbol = opp.symbol.toLowerCase().includes(q);
      const matchReason = opp.reason.toLowerCase().includes(q);
      if (!matchSymbol && !matchReason) return false;
    }

    return true;
  });
}

/**
 * Computes high-level KPI stats from the opportunities list
 */
export function computeTradingBotStats(opportunities: TradingOpportunity[]): TradingBotStats {
  const activeOpportunities = opportunities.length;
  const topProfitPercent = opportunities.length > 0 ? Math.max(...opportunities.map((o) => o.potentialMarginPercent)) : 0;

  return {
    activeOpportunities,
    topProfitPercent: roundHalfUp(topProfitPercent, 1),
    estimated24hYieldCoin: roundHalfUp(
      sumPrecise(opportunities.map((o) => o.potentialProfitCoin || 0)),
      2,
    ),
    signalsTriggeredToday: Math.min(activeOpportunities * 2, 48),
    botStatus: 'SCANNING',
    lastScannedAt: Date.now(),
  };
}
