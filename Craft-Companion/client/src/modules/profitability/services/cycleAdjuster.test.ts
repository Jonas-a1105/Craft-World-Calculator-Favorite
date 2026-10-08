import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  extractOwnedMap,
  getAdjustedCycle,
  filterAndSortSummaries,
} from './cycleAdjuster';
import type { FactoryDataRow } from '../../../services/factoryData';
import type { FactorySummary, AdjustedCycleResult } from '../types';

test('extractOwnedMap extracts maximum 1-indexed levels for owned factories', () => {
  const mockHome = {
    craftWorld: {
      landPlots: [
        {
          areas: [
            {
              factories: [
                {
                  factory: {
                    definition: { id: 'WOOD' },
                    level: 3, // real level 3
                  },
                },
                {
                  factory: {
                    definition: { id: 'WOOD' },
                    level: 5, // real level 5
                  },
                },
                {
                  factory: {
                    definition: { id: 'IRON' },
                    level: 1, // real level 1
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const map = extractOwnedMap(mockHome);
  assert.equal(map.get('WOOD'), 5);
  assert.equal(map.get('IRON'), 1);
  assert.equal(map.has('STONE'), false);
});

test('getAdjustedCycle calculates market input mode correctly', () => {
  const row: FactoryDataRow = {
    token: 'PLANK',
    level: 1,
    duration_min: 1,
    output_token: 'PLANK',
    output_amount: 2,
    input_token_1: 'WOOD',
    input_amount_1: 4,
    input_token_2: '',
    input_amount_2: 0,
    upgrade_token: '',
    upgrade_amount: 0,
  };

  const prices = { PLANK: 10, WOOD: 2 };
  const context = { workshop: [], proficiencies: [], activeBoosts: [] };

  const res = getAdjustedCycle({
    row,
    prices,
    context,
    inputSupplyMode: 'market',
    allRows: [row],
    useMastery: false,
  });

  assert.equal(res.effectiveInputCost, 8); // 4 * 2
  assert.equal(res.revenuePerCycle, 20); // 2 * 10
  assert.equal(res.effectiveProfitPerCycle, 12); // 20 - 8
  assert.equal(res.runsPerHour, 60);
  assert.equal(res.effectiveProfitPerHour, 720); // 12 * 60
});

test('filterAndSortSummaries filters and sorts by profit and alphabetical', () => {
  const rowA: FactoryDataRow = {
    token: 'ALPHA',
    level: 1,
    duration_min: 1,
    output_token: 'ALPHA',
    output_amount: 1,
    input_token_1: '',
    input_amount_1: 0,
    input_token_2: '',
    input_amount_2: 0,
    upgrade_token: '',
    upgrade_amount: 0,
  };

  const rowB: FactoryDataRow = {
    token: 'BETA',
    level: 1,
    duration_min: 1,
    output_token: 'BETA',
    output_amount: 1,
    input_token_1: '',
    input_amount_1: 0,
    input_token_2: '',
    input_amount_2: 0,
    upgrade_token: '',
    upgrade_amount: 0,
  };

  const mockSummaryA: FactorySummary = {
    token: 'ALPHA',
    ownedLevel: 1,
    activeRow: rowA,
    cycle: {
      row: rowA,
      factoryCount: 1,
      effectiveInputCost: 10,
      effectiveProfitPerCycle: 5,
      effectiveProfitPerHour: 300,
      effectiveProfitPerDay: 7200,
      runsPerHour: 60,
      runsPerDay: 1440,
      runtimeMinutes: 1,
      input1PerCycle: 0,
      input2PerCycle: 0,
      outputPerCycle: 1,
      outputPerHour: 60,
      outputPerDay: 1440,
      inputCostPerCycle: 10,
      revenuePerCycle: 15,
      profitPerCycle: 5,
      profitPerHour: 300,
      profitPerDay: 7200,
      marginPercent: 50,
      xpPerCycle: 1,
      xpPerHour: 60,
      xpPerDay: 1440,
    } as unknown as AdjustedCycleResult,
    allRows: [rowA],
  };

  const mockSummaryB: FactorySummary = {
    token: 'BETA',
    ownedLevel: null,
    activeRow: rowB,
    cycle: {
      row: rowB,
      factoryCount: 1,
      effectiveInputCost: 20,
      effectiveProfitPerCycle: -5,
      effectiveProfitPerHour: -300,
      effectiveProfitPerDay: -7200,
      runsPerHour: 60,
      runsPerDay: 1440,
      runtimeMinutes: 1,
      input1PerCycle: 0,
      input2PerCycle: 0,
      outputPerCycle: 1,
      outputPerHour: 60,
      outputPerDay: 1440,
      inputCostPerCycle: 20,
      revenuePerCycle: 15,
      profitPerCycle: -5,
      profitPerHour: -300,
      profitPerDay: -7200,
      marginPercent: -25,
      xpPerCycle: 1,
      xpPerHour: 60,
      xpPerDay: 1440,
    } as unknown as AdjustedCycleResult,
    allRows: [rowB],
  };

  const summaries = [mockSummaryB, mockSummaryA];

  // Filter owned
  const owned = filterAndSortSummaries({
    summaries,
    search: '',
    filterMode: 'owned',
    sortBy: 'alphabetical',
  });
  assert.equal(owned.length, 1);
  assert.equal(owned[0].token, 'ALPHA');

  // Filter loss
  const loss = filterAndSortSummaries({
    summaries,
    search: '',
    filterMode: 'loss',
    sortBy: 'alphabetical',
  });
  assert.equal(loss.length, 1);
  assert.equal(loss[0].token, 'BETA');

  // Sort by profit_hour (A should be first)
  const sorted = filterAndSortSummaries({
    summaries,
    search: '',
    filterMode: 'all',
    sortBy: 'profit_hour',
  });
  assert.equal(sorted[0].token, 'ALPHA');
  assert.equal(sorted[1].token, 'BETA');
});
