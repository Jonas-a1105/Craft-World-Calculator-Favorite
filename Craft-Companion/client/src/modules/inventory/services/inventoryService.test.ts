import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  CATEGORY_FILTERS,
  extractRecommendations,
  createPriceSnapshots,
  calculateValuedInventory,
  filterValuedItems,
} from './inventoryService';
import type { ValuedInventoryItem } from '../types';

test('extractRecommendations extracts uppercase symbol mappings', () => {
  const homeData = {
    priceList: {
      prices: [
        { referenceSymbol: 'earth', recommendation: 'BUY' },
        { referenceSymbol: 'STEEL', recommendation: 'SELL' },
        { referenceSymbol: null, recommendation: 'HOLD' },
      ],
    },
  };

  const recs = extractRecommendations(homeData);
  assert.equal(recs['EARTH'], 'BUY');
  assert.equal(recs['STEEL'], 'SELL');
  assert.equal(Object.keys(recs).length, 2);
});

test('createPriceSnapshots converts price list to snapshot objects', () => {
  const homeData = {
    priceList: {
      prices: [{ referenceSymbol: 'Copper', amount: 0.25 }],
    },
  };
  const fixedIso = '2026-10-07T12:00:00.000Z';
  const snapshots = createPriceSnapshots(homeData, fixedIso);
  assert.equal(snapshots.length, 1);
  assert.equal(snapshots[0].symbol, 'COPPER');
  assert.equal(snapshots[0].sellPriceCoin, 0.25);
  assert.equal(snapshots[0].buyPriceCoin, 0.25);
  assert.equal(snapshots[0].timestamp, fixedIso);
  assert.equal(snapshots[0].source, 'game');
});

test('calculateValuedInventory computes item values, sorts descending and calculates total', () => {
  const resources = [
    { symbol: 'EARTH', amount: 1000 },
    { symbol: 'STEEL', amount: 50 },
  ];
  const prices = {
    EARTH: 0.05, // 1000 * 0.05 = 50
    STEEL: 5.0,  // 50 * 5.0 = 250
  };
  const recMap = { STEEL: 'SELL' };
  const mockHistory: import('../../../services/priceHistory').PriceSnapshot[] = [];

  const result = calculateValuedInventory(resources, prices, recMap, mockHistory);
  assert.equal(result.totalValue, 300);
  assert.equal(result.valuedItems.length, 2);
  // Sorted descending by totalValue: STEEL (250) first, EARTH (50) second
  assert.equal(result.valuedItems[0].symbol, 'STEEL');
  assert.equal(result.valuedItems[0].totalValue, 250);
  assert.equal(result.valuedItems[0].recommendation, 'SELL');
  assert.equal(result.valuedItems[1].symbol, 'EARTH');
  assert.equal(result.valuedItems[1].totalValue, 50);
});

test('filterValuedItems filters correctly based on category token lists', () => {
  const defaultDelta = { percentStr: '0%', isUp: false };
  const items: ValuedInventoryItem[] = [
    { symbol: 'EARTH', amount: 100, unitPrice: 1, totalValue: 100, recommendation: '', delta: defaultDelta },
    { symbol: 'WATER', amount: 100, unitPrice: 1, totalValue: 100, recommendation: '', delta: defaultDelta },
    { symbol: 'FIRE', amount: 100, unitPrice: 1, totalValue: 100, recommendation: '', delta: defaultDelta },
  ];

  // No filter
  assert.equal(filterValuedItems(items, null).length, 3);

  // Earth category
  const earthItems = filterValuedItems(items, 'earth');
  assert.equal(earthItems.length, 1);
  assert.equal(earthItems[0].symbol, 'EARTH');

  // Water category
  const waterItems = filterValuedItems(items, 'water');
  assert.equal(waterItems.length, 1);
  assert.equal(waterItems[0].symbol, 'WATER');

  // Unknown category falls back to all items
  assert.equal(filterValuedItems(items, 'non-existent').length, 3);
});
