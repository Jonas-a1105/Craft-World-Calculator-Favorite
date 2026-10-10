import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateTradingOpportunities,
  filterOpportunities,
  computeTradingBotStats,
} from './tradingSignalsService';
import { calculateCraftArbitrage } from './arbitrageEngine';
import type { FactoryDataRow } from '../../../services/craftworldCalculations';
import type { MarketPriceItem } from '../../prices/types';
import type { WatchlistRule } from '../types';

describe('Trading Bot - Opportunity & Arbitrage Engine', () => {
  const mockPrices: MarketPriceItem[] = [
    { referenceSymbol: 'Copper', amount: 10, recommendation: 'BUY' },
    { referenceSymbol: 'Gold', amount: 150, recommendation: 'SELL' },
    { referenceSymbol: 'Wood', amount: 5, recommendation: 'HOLD' },
    { referenceSymbol: 'Paperwrap', amount: 30, recommendation: 'BUY' },
  ];

  const mockFactoryRow: FactoryDataRow = {
    token: 'Paperwrap',
    level: 1,
    duration_min: 10,
    output_token: 'Paperwrap',
    output_amount: 1,
    input_token_1: 'Wood',
    input_amount_1: 2, // 2 Wood * 5 = 10 COIN cost
    input_token_2: '',
    input_amount_2: 0,
    upgrade_token: 'Wood',
    upgrade_amount: 10,
  };

  it('calculates craft arbitrage accurately with 5% marketplace commission', () => {
    const priceMap = {
      WOOD: 5,
      PAPERWRAP: 30,
    };

    const result = calculateCraftArbitrage(mockFactoryRow, priceMap);
    assert.ok(result !== null);
    assert.strictEqual(result.symbol, 'Paperwrap');
    assert.strictEqual(result.costToCraftCoin, 10);
    assert.strictEqual(result.marketSellPriceCoin, 30);
    assert.strictEqual(result.netRevenueCoin, 28.5); // 30 * 0.95
    assert.strictEqual(result.netProfitCoin, 18.5); // 28.5 - 10
    assert.strictEqual(result.marginPercent, 185); // (18.5 / 10) * 100
    assert.strictEqual(result.isProfitable, true);
  });

  it('generates craft arbitrage and watchlist opportunities', () => {
    const watchlist: WatchlistRule[] = [
      {
        id: 'rule-1',
        symbol: 'Copper',
        condition: 'BELOW',
        targetValue: 12, // current is 10, so triggered!
        enabled: true,
        createdAt: Date.now(),
      },
    ];

    const opportunities = generateTradingOpportunities({
      marketPrices: mockPrices,
      factoryRows: [mockFactoryRow],
      watchlist,
    });

    assert.ok(opportunities.length > 0);

    const watchHit = opportunities.find((o) => o.type === 'WATCHLIST_HIT');
    assert.ok(watchHit);
    assert.strictEqual(watchHit.symbol, 'Copper');

    const arbHit = opportunities.find((o) => o.type === 'CRAFT_ARBITRAGE');
    assert.ok(arbHit);
    assert.strictEqual(arbHit.symbol, 'Paperwrap');
  });

  it('filters opportunities by filter type and search text', () => {
    const watchlist: WatchlistRule[] = [
      {
        id: 'rule-1',
        symbol: 'Copper',
        condition: 'BELOW',
        targetValue: 12,
        enabled: true,
        createdAt: Date.now(),
      },
    ];

    const opportunities = generateTradingOpportunities({
      marketPrices: mockPrices,
      factoryRows: [mockFactoryRow],
      watchlist,
    });

    const onlyArbitrage = filterOpportunities(opportunities, 'CRAFT_ARBITRAGE', '');
    assert.ok(onlyArbitrage.every((o) => o.type === 'CRAFT_ARBITRAGE'));

    const searchPaper = filterOpportunities(opportunities, 'ALL', 'paper');
    assert.ok(searchPaper.length >= 1);
    assert.strictEqual(searchPaper[0].symbol, 'Paperwrap');
  });

  it('computes trading bot KPIs accurately', () => {
    const watchlist: WatchlistRule[] = [
      {
        id: 'rule-1',
        symbol: 'Copper',
        condition: 'BELOW',
        targetValue: 12,
        enabled: true,
        createdAt: Date.now(),
      },
    ];

    const opportunities = generateTradingOpportunities({
      marketPrices: mockPrices,
      factoryRows: [mockFactoryRow],
      watchlist,
    });

    const stats = computeTradingBotStats(opportunities);
    assert.strictEqual(stats.botStatus, 'SCANNING');
    assert.ok(stats.activeOpportunities >= 1);
    assert.ok(stats.topProfitPercent > 0);
    assert.ok(stats.estimated24hYieldCoin > 0);
  });
});
