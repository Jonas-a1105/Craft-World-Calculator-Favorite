import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  calculateSpeedMultiplier,
  sortResourcesByOrder,
  formatProfit,
  formatCompactPrice,
  getCellBgClass,
  calculateProfitPerHour,
} from './matrixService';
import type { FactoryDataRow } from '../../../services/factoryData';

test('calculateSpeedMultiplier handles combinations of ad and factory boosts', () => {
  assert.equal(calculateSpeedMultiplier(false, 'none'), 1);
  assert.equal(calculateSpeedMultiplier(true, 'none'), 2);
  assert.equal(calculateSpeedMultiplier(false, '2x'), 2);
  assert.equal(calculateSpeedMultiplier(true, '2x'), 4);
  assert.equal(calculateSpeedMultiplier(false, '3.6x'), 3.6);
  assert.equal(calculateSpeedMultiplier(true, '3.6x'), 7.2);
  assert.equal(calculateSpeedMultiplier(true, '5x'), 10);
});

test('sortResourcesByOrder sorts known resources by canonical game hierarchy and others alphabetically', () => {
  const sorted = sortResourcesByOrder(['UNKNOWN_B', 'SAND', 'MUD', 'UNKNOWN_A', 'CLAY']);
  assert.deepEqual(sorted, ['MUD', 'CLAY', 'SAND', 'UNKNOWN_A', 'UNKNOWN_B']);
});

test('formatProfit formats values concisely with sign', () => {
  assert.equal(formatProfit(12500), '+12.5k');
  assert.equal(formatProfit(500), '+500');
  assert.equal(formatProfit(25.4), '+25.4');
  assert.equal(formatProfit(3.1415), '+3.14');
  assert.equal(formatProfit(-15.2), '-15.2');
  assert.equal(formatProfit(-12500), '-12.5k');
});

test('formatCompactPrice renders prices without clutter', () => {
  assert.equal(formatCompactPrice(undefined), '0');
  assert.equal(formatCompactPrice(0), '0');
  assert.equal(formatCompactPrice(0.005), '0.005');
  assert.equal(formatCompactPrice(0.05), '0.05');
  assert.equal(formatCompactPrice(12.34), '12.3');
  assert.equal(formatCompactPrice(150), '150');
  assert.equal(formatCompactPrice(1500), '1.5k');
  assert.equal(formatCompactPrice(25000), '25k');
});

test('getCellBgClass returns correct CSS classes according to thresholds', () => {
  assert.match(getCellBgClass(0, false), /text-zinc-600/);
  assert.match(getCellBgClass(100, true), /text-emerald-300 bg-emerald-500\/25/);
  assert.match(getCellBgClass(20, true), /text-emerald-400 bg-emerald-500\/15/);
  assert.match(getCellBgClass(5, true), /text-emerald-400\/90 bg-emerald-500\/5/);
  assert.match(getCellBgClass(0, true), /text-zinc-400 bg-zinc-800\/20/);
  assert.match(getCellBgClass(-5, true), /text-rose-400\/80 bg-rose-500\/10/);
  assert.match(getCellBgClass(-30, true), /text-rose-400 bg-rose-500\/20/);
  assert.match(getCellBgClass(-100, true), /text-rose-300 bg-rose-500\/30/);
});

test('calculateProfitPerHour computes revenue, input cost and hourly profit correctly', () => {
  const dummyRow: FactoryDataRow = {
    token: 'STEEL',
    level: 1,
    duration_min: 10,
    input_token_1: 'IRON',
    input_amount_1: 2,
    input_token_2: 'COAL',
    input_amount_2: 1,
    output_token: 'STEEL',
    output_amount: 1,
    upgrade_token: '',
    upgrade_amount: 0,
  };

  const prices: Record<string, number> = {
    IRON: 10,
    COAL: 5,
    STEEL: 50,
  };

  // Base: inputCost = 25, revenue = 50, profit/cycle = 25. Cycles/hr = 60/10 = 6 => 150/hr
  const baseResult = calculateProfitPerHour(
    dummyRow,
    'STEEL',
    0, // mastery
    1, // speed
    prices,
    1.0, // buy slippage
    1.0, // sell slippage
    0, // power price
  );

  assert.equal(baseResult.valid, true);
  assert.equal(baseResult.runtime, 10);
  assert.equal(baseResult.profit, 150);

  // With 2x speed: runtime = 5 min, cycles/hr = 12 => profit = 300/hr
  const speedResult = calculateProfitPerHour(
    dummyRow,
    'STEEL',
    0,
    2,
    prices,
    1.0,
    1.0,
    0,
  );
  assert.equal(speedResult.profit, 300);

  // Missing row returns invalid
  const missingResult = calculateProfitPerHour(
    undefined,
    'STEEL',
    0,
    1,
    prices,
    1.0,
    1.0,
    0,
  );
  assert.equal(missingResult.valid, false);
  assert.equal(missingResult.profit, 0);
});
