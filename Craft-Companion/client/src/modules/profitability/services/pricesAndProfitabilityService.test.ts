import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  aggregateAccountFactories,
  getInitialFactoryRowConfig,
  getResourceCategory,
} from './accountAggregator';
import {
  computeFactoryTableRow,
  calculateSummaryTotals,
  filterAndSortTableRows,
} from './pricesAndProfitabilityService';
import type { FactoryDataRow } from '../../../services/factoryData';
import type { FactoryRowConfig, GlobalProfitabilitySettings } from '../types';

test('getResourceCategory accurately classifies core resources', () => {
  assert.equal(getResourceCategory('EARTH'), 'earth');
  assert.equal(getResourceCategory('MUD'), 'earth');
  assert.equal(getResourceCategory('WATER'), 'water');
  assert.equal(getResourceCategory('FIRE'), 'fire');
  assert.equal(getResourceCategory('STEEL'), 'fire');
  assert.equal(getResourceCategory('GAS'), 'special');
  assert.equal(getResourceCategory('DYNAMITE'), 'special');
});

test('aggregateAccountFactories correctly aggregates multiple factory instances on plots', () => {
  const mockHome = {
    purchases: { isNoAdsActive: true },
    craft: {
      workshop: [{ definitionId: 'STEEL', level: 5 }],
      proficiencies: [{ symbol: 'STEEL', level: 10, claimedLevel: 10 }],
    },
    craftWorld: {
      landPlots: [
        {
          id: 'plot-1',
          areas: [
            {
              factories: [
                {
                  factory: { definition: { id: 'STEEL' }, level: 14 },
                  workerBoostIntervals: [{ boostValue: 0.1 }],
                },
                {
                  factory: { definition: { id: 'STEEL' }, level: 20 },
                  workerBoostIntervals: [{ boostValue: 0.2 }],
                },
              ],
            },
          ],
        },
        {
          id: 'plot-2',
          areas: [
            {
              factories: [
                {
                  factory: { definition: { id: 'MUD' }, level: 18 },
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const aggMap = aggregateAccountFactories(mockHome as any);

  // STEEL has 2 instances!
  const steel = aggMap.get('STEEL');
  assert.ok(steel);
  assert.equal(steel.count, 2);
  assert.equal(steel.highestLevel, 20);
  assert.equal(steel.masteryLevel, 10);
  assert.equal(steel.boost, 'x2'); // because isNoAdsActive is true

  // MUD has 1 instance
  const mud = aggMap.get('MUD');
  assert.ok(mud);
  assert.equal(mud.count, 1);
  assert.equal(mud.highestLevel, 18);
});

test('computeFactoryTableRow correctly computes net profit and zero profit when count is 0', () => {
  const tokenRows: FactoryDataRow[] = [
    {
      token: 'STEEL',
      level: 1,
      duration_min: 10,
      output_token: 'STEEL',
      output_amount: 1,
      input_token_1: 'COPPER',
      input_amount_1: 2,
      input_token_2: '',
      input_amount_2: 0,
      upgrade_token: '',
      upgrade_amount: 0,
      power_cost: 100,
    },
  ];

  const prices = {
    STEEL: 50,
    COPPER: 10,
  };

  const config: FactoryRowConfig = {
    count: 2,
    level: 1,
    masteryLevel: 10,
    workerPercent: 0,
    workshopPercent: 0,
    boost: 'None',
  };

  const settings: GlobalProfitabilitySettings = {
    adBoost2x: false,
    buySlippage: false,
    sellSlippage: false,
    powerPriceCoin: 0,
    inputSupplyMode: 'market',
  };

  const row = computeFactoryTableRow({
    token: 'STEEL',
    config,
    accountBaseline: config,
    prices,
    tokenRows,
    allRows: tokenRows,
    settings,
    coinUsdPrice: 0.00022,
  });

  // Cycle runs 60 / 10 = 6 runs per hour per factory
  // Output revenue per cycle = 1 * 50 = 50
  // Input cost per cycle (with mastery red ~5.3%) = 2 * (1 - 0.053) * 10 = 18.94
  // Profit per cycle = 31.06
  // Profit per hour for 2 factories = 31.06 * 6 * 2 = ~372.7
  assert.equal(row.runsPerHour, 6);
  assert.ok(row.profitPerHour > 300);
  assert.equal(row.powerKwPerHour, 100 * 6 * 2); // 1,200 kW

  // When count is 0, power and profit must be 0!
  const zeroRow = computeFactoryTableRow({
    token: 'STEEL',
    config: { ...config, count: 0 },
    accountBaseline: config,
    prices,
    tokenRows,
    allRows: tokenRows,
    settings,
    coinUsdPrice: 0.00022,
  });

  assert.equal(zeroRow.count, 0);
  assert.equal(zeroRow.powerKwPerHour, 0);
  assert.equal(zeroRow.profitPerHour, 0);
});

test('calculateSummaryTotals sums only active factories with count > 0', () => {
  const mockRows: any[] = [
    { count: 4, profitPerHour: 100, powerKwPerHour: 500, powerCostCoinPerHour: 0 },
    { count: 0, profitPerHour: 0, powerKwPerHour: 0, powerCostCoinPerHour: 0 },
    { count: 2, profitPerHour: 50, powerKwPerHour: 200, powerCostCoinPerHour: 0 },
  ];

  const totals = calculateSummaryTotals(mockRows, 0.000228, 0.5, 2.0);
  assert.equal(totals.totalActiveFactories, 6);
  assert.equal(totals.totalActiveTokens, 2);
  assert.equal(totals.totalProfitPerHour, 150);
  assert.equal(totals.totalPowerKwPerHour, 700);
});
