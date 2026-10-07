import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  filterMarketPrices,
  getRecommendationVariant,
} from './pricesService';
import type { MarketPriceItem } from '../types';

const mockPrices: MarketPriceItem[] = [
  { referenceSymbol: 'EARTH', amount: 0.005, recommendation: 'BUY' },
  { referenceSymbol: 'STEEL', amount: 5.5, recommendation: 'SELL' },
  { referenceSymbol: 'COPPER', amount: 0.8, recommendation: 'HOLD' },
];

test('filterMarketPrices filters by query case-insensitively and returns all when query is empty', () => {
  assert.equal(filterMarketPrices(mockPrices, '').length, 3);
  assert.equal(filterMarketPrices(mockPrices, '   ').length, 3);

  const earth = filterMarketPrices(mockPrices, 'earth');
  assert.equal(earth.length, 1);
  assert.equal(earth[0].referenceSymbol, 'EARTH');

  const partial = filterMarketPrices(mockPrices, 'ee');
  assert.equal(partial.length, 1);
  assert.equal(partial[0].referenceSymbol, 'STEEL');
});

test('getRecommendationVariant returns correct badge variant', () => {
  assert.equal(getRecommendationVariant('BUY'), 'success');
  assert.equal(getRecommendationVariant('buy'), 'success');
  assert.equal(getRecommendationVariant('SELL'), 'danger');
  assert.equal(getRecommendationVariant('sell'), 'danger');
  assert.equal(getRecommendationVariant('HOLD'), 'neutral');
  assert.equal(getRecommendationVariant(''), 'neutral');
  assert.equal(getRecommendationVariant(undefined), 'neutral');
});
