import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { filterAndSortRecommendations } from './upgradeAdvisorService';
import type { UpgradeRecommendation } from '../types';

import type { FactoryDataRow } from '../../../services/craftworldCalculations';

function mockFactoryRow(token: string, level = 1, upgrade_token = ''): FactoryDataRow {
  return {
    token,
    level,
    duration_min: 10,
    output_token: token,
    output_amount: 1,
    input_token_1: '',
    input_amount_1: 0,
    input_token_2: '',
    input_amount_2: 0,
    upgrade_token,
    upgrade_amount: 10,
  };
}

const mockRecs: UpgradeRecommendation[] = [
  {
    row: mockFactoryRow('STEEL', 1),
    nextRow: mockFactoryRow('STEEL', 2, 'COIN'),
    upgradeCost: 100,
    addedProfitPerDay: 50,
    addedProductionPerDay: 10,
    addedXpPerDay: 5,
    paybackDays: 2.0,
    reason: 'Excelente payback en 2 días',
    label: 'Best ROI',
  },
  {
    row: mockFactoryRow('COPPER', 2),
    nextRow: mockFactoryRow('COPPER', 3, 'WIRE'),
    upgradeCost: 500,
    addedProfitPerDay: 500,
    addedProductionPerDay: 100,
    addedXpPerDay: 50,
    paybackDays: 1.0,
    reason: 'Rápido retorno con insumo Wire',
    label: 'Best profit gain',
  },
  {
    row: mockFactoryRow('GLASS', 3),
    nextRow: mockFactoryRow('GLASS', 4, 'SAND'),
    upgradeCost: 1000,
    addedProfitPerDay: 100,
    addedProductionPerDay: 20,
    addedXpPerDay: 10,
    paybackDays: 10.0,
    reason: 'Payback largo',
    label: 'Bottleneck fix',
  },
];

test('filterAndSortRecommendations filters by fast_roi (paybackDays <= 3)', () => {
  const result = filterAndSortRecommendations(mockRecs, '', 'fast_roi');
  assert.equal(result.length, 2);
  assert.ok(result.every((r) => r.paybackDays !== null && r.paybackDays <= 3));
});

test('filterAndSortRecommendations sorts descending by addedProfitPerDay on best_profit', () => {
  const result = filterAndSortRecommendations(mockRecs, '', 'best_profit');
  assert.equal(result.length, 3);
  assert.equal(result[0].row.token, 'COPPER'); // 500 profit
  assert.equal(result[1].row.token, 'GLASS');  // 100 profit
  assert.equal(result[2].row.token, 'STEEL');  // 50 profit
});

test('filterAndSortRecommendations searches across token, reason and upgrade token', () => {
  // Search by token
  const byToken = filterAndSortRecommendations(mockRecs, 'steel', 'all');
  assert.equal(byToken.length, 1);
  assert.equal(byToken[0].row.token, 'STEEL');

  // Search by reason
  const byReason = filterAndSortRecommendations(mockRecs, 'largo', 'all');
  assert.equal(byReason.length, 1);
  assert.equal(byReason[0].row.token, 'GLASS');

  // Search by upgrade_token
  const byUpgradeToken = filterAndSortRecommendations(mockRecs, 'wire', 'all');
  assert.equal(byUpgradeToken.length, 1);
  assert.equal(byUpgradeToken[0].row.token, 'COPPER');
});
