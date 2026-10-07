import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  formatShortAmount,
  generateChartSeries,
  extractActivityTrades,
  TIMEFRAME_CONFIG,
} from './resourceDetailService';

test('formatShortAmount abbreviates millions, thousands and standard values', () => {
  const expectedM = `${(2.5).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
  const expectedK = `${(12.5).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
  assert.equal(formatShortAmount(2_500_000), expectedM);
  assert.equal(formatShortAmount(12_500), expectedK);
  assert.equal(formatShortAmount(150), '150');
});

test('generateChartSeries generates points matching timeframe configuration and anchors to currentPrice', () => {
  const currentPrice = 0.05;
  const series1H = generateChartSeries(currentPrice, 'EARTH', '1H', 'es', 1000000);
  assert.equal(series1H.points.length, TIMEFRAME_CONFIG['1H'].numPoints);
  assert.equal(series1H.points[series1H.points.length - 1].val, currentPrice);
  assert.ok(series1H.polylinePoints.length > 0);
  assert.ok(series1H.areaPoints.includes('220')); // svgHeight anchor

  const series1D = generateChartSeries(currentPrice, 'STEEL', '1D', 'en', 1000000);
  assert.equal(series1D.points.length, TIMEFRAME_CONFIG['1D'].numPoints);
  assert.equal(series1D.points[series1D.points.length - 1].val, currentPrice);

  const seriesMAX = generateChartSeries(currentPrice, 'STEEL', 'MAX', 'en', 1000000);
  assert.equal(seriesMAX.points.length, TIMEFRAME_CONFIG['MAX'].numPoints);
});

test('extractActivityTrades parses executions or returns realistic fallback seeds', () => {
  // Test fallback seeds
  const fallbackTrades = extractActivityTrades(undefined, 'COPPER', 0.1);
  assert.equal(fallbackTrades.length, 6);
  assert.equal(fallbackTrades[0].outSymbol, 'COPPER');
  assert.equal(fallbackTrades[0].success, true);

  // Test real executions
  const mockExecutions = [
    {
      id: 'trade-xyz',
      trade: {
        input: { symbol: 'COIN', amount: 500 },
        output: { symbol: 'COPPER', amount: 5000 },
      },
      errorReason: null,
    },
  ];
  const realTrades = extractActivityTrades(mockExecutions, 'COPPER', 0.1);
  assert.equal(realTrades.length, 1);
  assert.equal(realTrades[0].id, 'trade-xyz');
  assert.equal(realTrades[0].inSymbol, 'COIN');
  assert.equal(realTrades[0].outSymbol, 'COPPER');
  assert.equal(realTrades[0].success, true);
});
