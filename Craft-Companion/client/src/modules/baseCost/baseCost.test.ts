import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  calcBaseResources,
  calculateBaseCostRow,
  getMarginTextColor,
  formatQuantity,
  formatCoin,
  calculateSummaryStats,
} from './services/baseCostCalculatorService';
import {
  ALL_BASE_COST_TOKENS,
  BASE_COST_CATEGORIES,
  getMaxFactoryLevel,
  clampFactoryLevel,
} from './data/baseCostCatalog';
import type { BaseCostSettings } from './types';

test('BaseCost: should have 48 craftable tokens across 9 categories', () => {
  assert.equal(BASE_COST_CATEGORIES.length, 9);
  assert.equal(ALL_BASE_COST_TOKENS.length, 48);
  assert.equal(new Set(ALL_BASE_COST_TOKENS).size, 48);
});

test('BaseCost: should return base elemental 1 unit for root tokens', () => {
  const emptyLevels = {};
  const emptyMasteries = {};

  const earth = calcBaseResources('EARTH', emptyLevels, emptyMasteries);
  assert.equal(earth.earth, 1);
  assert.equal(earth.water, 0);
  assert.equal(earth.powerPerUnit, 0);

  const water = calcBaseResources('WATER', emptyLevels, emptyMasteries);
  assert.equal(water.water, 1);

  const fire = calcBaseResources('FIRE', emptyLevels, emptyMasteries);
  assert.equal(fire.fire, 1);
});

test('BaseCost: should calculate MUD base resources at Level 1 Mastery 0 as 3 Earth', () => {
  const res = calcBaseResources('MUD', { MUD: 1 }, { MUD: 0 });
  assert.equal(res.earth, 3);
  assert.equal(res.water, 0);
  assert.equal(res.powerPerUnit, 0);
});

test('BaseCost: should reduce input requirements when mastery is applied', () => {
  // Mastery 10 has multiplier 1.0525, so 3 / 1.0525 = ~2.850356 Earth
  const res = calcBaseResources('MUD', { MUD: 1 }, { MUD: 10 });
  assert.ok(Math.abs(res.earth - 3 / 1.0525) < 0.001);
  assert.equal(formatQuantity(res.earth), '2.85');
});

test('BaseCost: should calculate multi-step craft tree for STEEL and CERAMICS', () => {
  const steelBase = calcBaseResources('STEEL', {}, {});
  assert.ok(steelBase.earth > 1000);
  assert.ok(steelBase.powerPerUnit > 0);

  const ceramicsBase = calcBaseResources('CERAMICS', {}, {});
  assert.ok(ceramicsBase.earth > 1000);
  assert.ok(ceramicsBase.water > 10);
});

test('BaseCost: should correctly apply buy and sell slippages in financial calculations', () => {
  const settings: BaseCostSettings = {
    buySlippage: true,
    buySlippagePct: 3, // +3% on buy
    sellSlippage: true,
    sellSlippagePct: 3, // -3% on sell
    powerPricePer100k: 50,
  };

  const prices = {
    EARTH: 0.00394,
    WATER: 0.00394,
    FIRE: 0.00394,
    DUST: 0.001,
    LUMBER: 0.001,
    MUD: 0.012,
  };

  const row = calculateBaseCostRow(
    'MUD',
    { MUD: 1 },
    { MUD: 0 },
    settings,
    prices,
    'earth',
  );
  // Mud raw = 3 * 0.00394 = 0.01182
  // Buy slippage +3% = 0.01182 * 1.03 = 0.0121746
  assert.ok(Math.abs(row.baseCost - 0.01182 * 1.03) < 0.0001);
  // Sell slippage -3% = 0.012 * 0.97 = 0.01164
  assert.ok(Math.abs(row.sellPrice - 0.012 * 0.97) < 0.0001);
  // Profit = 0.01164 - 0.0121746 = -0.0005346
  assert.ok(row.profit < 0);
  assert.ok(row.marginPct !== null && row.marginPct < 0);
});

test('BaseCost: should format quantities and currency numbers properly', () => {
  assert.equal(formatQuantity(0), '—');
  assert.equal(formatQuantity(2.85), '2.85');
  assert.equal(formatQuantity(8680), '8.68k');
  assert.equal(formatQuantity(22400), '22.4k');
  assert.equal(formatQuantity(1500000), '1.50M');

  assert.equal(formatCoin(0.000102), '0.000102');
  assert.equal(formatCoin(15.42), '15.42');
});

test('BaseCost: should return valid clamp and max levels', () => {
  assert.equal(getMaxFactoryLevel('MUD'), 50);
  assert.equal(clampFactoryLevel('MUD', 999), 50);
  assert.equal(clampFactoryLevel('MUD', 0), 1);
  assert.equal(clampFactoryLevel('MUD', 25), 25);
});

test('BaseCost: should generate summary stats with elemental prices', () => {
  const settings: BaseCostSettings = {
    buySlippage: false,
    buySlippagePct: 0,
    sellSlippage: false,
    sellSlippagePct: 0,
    powerPricePer100k: 0,
  };
  const prices = {
    EARTH: 0.01,
    WATER: 0.02,
    FIRE: 0.03,
    DUST: 0.04,
    LUMBER: 0.05,
    MUD: 0.05,
  };
  const row = calculateBaseCostRow(
    'MUD',
    { MUD: 1 },
    { MUD: 0 },
    settings,
    prices,
    'earth',
  );
  const stats = calculateSummaryStats([row], prices);

  assert.equal(stats.totalTracked, 1);
  assert.equal(stats.elementalPrices.earth, 0.01);
  assert.equal(stats.elementalPrices.water, 0.02);
  assert.equal(stats.profitableCount, 1);
  assert.equal(stats.bestProfitItem?.token, 'MUD');
});

test('BaseCost: should calculate smooth margin text color without throwing', () => {
  assert.equal(getMarginTextColor(0), '#6B67A0');
  assert.ok(getMarginTextColor(50).includes('rgb('));
  assert.ok(getMarginTextColor(-30).includes('rgb('));
  assert.equal(getMarginTextColor(null), '#6B67A0');
});

test('BaseCost: should correctly identify root resources and default to market', () => {
  const settings: BaseCostSettings = {
    buySlippage: false,
    buySlippagePct: 0,
    sellSlippage: false,
    sellSlippagePct: 0,
    powerPricePer100k: 0,
  };
  const prices = { EARTH: 0.005 };
  const row = calculateBaseCostRow('EARTH', {}, {}, settings, prices, 'earth');
  assert.equal(row.isRootResource, true);
  assert.equal(row.bestStrategy, 'buy_market');
  assert.equal(row.directInputs.length, 0);
});

test('BaseCost: should recommend crafting when market price exceeds craft cost', () => {
  const settings: BaseCostSettings = {
    buySlippage: false,
    buySlippagePct: 0,
    sellSlippage: false,
    sellSlippagePct: 0,
    powerPricePer100k: 0,
  };
  // Mud craft cost = 3 * Earth (0.01) = 0.03
  // Mud market price = 0.10 (more expensive on market -> better to craft!)
  const prices = { EARTH: 0.01, MUD: 0.1 };
  const row = calculateBaseCostRow('MUD', { MUD: 1 }, { MUD: 0 }, settings, prices, 'earth');
  assert.equal(row.isRootResource, false);
  assert.equal(row.isCraftCheaper, true);
  assert.ok(row.bestStrategy === 'craft_direct' || row.bestStrategy === 'craft_base');
  assert.ok(row.savingsPct > 50);
  assert.equal(row.directInputs.length, 1);
  assert.equal(row.directInputs[0].symbol, 'EARTH');
});

test('BaseCost: should recommend buying on market when craft cost exceeds market price', () => {
  const settings: BaseCostSettings = {
    buySlippage: false,
    buySlippagePct: 0,
    sellSlippage: false,
    sellSlippagePct: 0,
    powerPricePer100k: 0,
  };
  // Mud craft cost = 3 * Earth (0.05) = 0.15
  // Mud market price = 0.05 (much cheaper on market -> buy on market!)
  const prices = { EARTH: 0.05, MUD: 0.05 };
  const row = calculateBaseCostRow('MUD', { MUD: 1 }, { MUD: 0 }, settings, prices, 'earth');
  assert.equal(row.isRootResource, false);
  assert.equal(row.isCraftCheaper, false);
  assert.equal(row.bestStrategy, 'buy_market');
  assert.ok(row.savingsPct > 0);
});
