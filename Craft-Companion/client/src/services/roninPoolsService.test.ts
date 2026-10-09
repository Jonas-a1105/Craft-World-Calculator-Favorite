import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildRealChartSeries,
  type PoolResourceItem,
} from './roninPoolsService';

const mockPoolItem: PoolResourceItem = {
  symbol: 'WATER',
  price1d: {
    average: 2.35,
    median: 2.41,
    ath: 2.50,
    atl: 2.10,
    history: [
      { timestamp: '2026-10-09T00:00:00Z', price: 2.10 },
      { timestamp: '2026-10-09T06:00:00Z', price: 2.30 },
      { timestamp: '2026-10-09T12:00:00Z', price: 2.50 },
      { timestamp: '2026-10-09T18:00:00Z', price: 2.40 },
    ],
  },
  price7d: {
    average: 2.36,
    median: 2.38,
    ath: 2.80,
    atl: 1.95,
    history: [
      { timestamp: '2026-10-03T00:00:00Z', price: 2.00 },
      { timestamp: '2026-10-06T00:00:00Z', price: 2.40 },
      { timestamp: '2026-10-09T00:00:00Z', price: 2.35 },
    ],
  },
  price30d: {
    average: 3.10,
    median: 3.05,
    ath: 3.90,
    atl: 1.80,
    history: [
      { timestamp: '2026-09-10T00:00:00Z', price: 1.90 },
      { timestamp: '2026-09-25T00:00:00Z', price: 3.20 },
      { timestamp: '2026-10-09T00:00:00Z', price: 2.35 },
    ],
  },
  liquidity: {
    average: 8719119,
    median: 8772905,
    ath: 8805818,
    atl: 8549941,
  },
  coinRate: {
    average: 17091402,
    median: 17320449,
    ath: 17393235,
    atl: 16325652,
  },
};

test('buildRealChartSeries constructs correct SVG geometry and stats for 1D timeframe', () => {
  const series = buildRealChartSeries(mockPoolItem, '1D', 2.45, 'es');
  assert.ok(series !== null);
  if (!series) return;
  assert.equal(series.points.length, 4);

  // Latest point should be anchored to live current price (2.45)
  assert.equal(series.points[series.points.length - 1].val, 2.45);

  // First point should match initial timestamp
  assert.equal(series.points[0].val, 2.10);

  // Price went from 2.10 to 2.45, so it is up
  assert.equal(series.isUp, true);
  assert.ok(series.changeAbs > 0.3);
  assert.ok(series.polylinePoints.includes(','));
  assert.ok(series.areaPoints.includes('800'));
});

test('buildRealChartSeries switches to 7d and 30d history correctly', () => {
  const series7d = buildRealChartSeries(mockPoolItem, '1W', 2.35, 'en');
  assert.ok(series7d !== null);
  if (series7d) {
    assert.equal(series7d.points.length, 3);
  }

  const series30d = buildRealChartSeries(mockPoolItem, '1M', 2.35, 'en');
  assert.ok(series30d !== null);
  if (series30d) {
    assert.equal(series30d.points.length, 3);
  }
});

test('buildRealChartSeries returns null safely if history is missing', () => {
  const emptyItem: PoolResourceItem = {
    ...mockPoolItem,
    price1d: { average: 0, median: 0, ath: 0, atl: 0, history: [] },
  };
  const series = buildRealChartSeries(emptyItem, '1D', 1, 'es');
  assert.equal(series, null);
});
