import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  extractValueChainPrices,
  computeValueChainAnalysis,
  DEFAULT_BASE_PRICES,
  FEATURED_TARGETS,
} from './valueChainService';
import type { FactoryDataRow } from '../../../services/factoryData';

test('extractValueChainPrices includes base tokens and updates from home data', () => {
  const homeData = {
    priceList: {
      prices: [
        { referenceSymbol: 'steel', amount: 4.5 },
        { referenceSymbol: 'earth', amount: 0.005 },
      ],
    },
  };

  const prices = extractValueChainPrices(homeData);
  assert.equal(prices['COIN'], 1);
  assert.equal(prices['STEEL'], 4.5);
  assert.equal(prices['EARTH'], 0.005);
  assert.equal(prices['WATER'], DEFAULT_BASE_PRICES['WATER']);
});

test('FEATURED_TARGETS contains canonical industrial products', () => {
  assert.ok(FEATURED_TARGETS.length >= 10);
  assert.ok(FEATURED_TARGETS.some((t) => t.token === 'COPPER'));
  assert.ok(FEATURED_TARGETS.some((t) => t.token === 'STEEL'));
});

test('computeValueChainAnalysis computes linear production chain for Mud', () => {
  const mockRows: FactoryDataRow[] = [
    {
      token: 'MUD',
      level: 1,
      duration_min: 10,
      input_token_1: 'EARTH',
      input_amount_1: 5,
      input_token_2: '',
      input_amount_2: 0,
      output_token: 'MUD',
      output_amount: 1,
      upgrade_token: 'MUD',
      upgrade_amount: 10,
    },
  ];

  const prices = {
    COIN: 1,
    EARTH: 0.01,
    MUD: 0.1,
  };

  const analysis = computeValueChainAnalysis('MUD', 1, mockRows, prices, [], 'self_crafted');
  assert.ok(analysis !== null);
  assert.equal(analysis?.targetToken, 'MUD');
  assert.equal(analysis?.targetLevel, 1);
  assert.ok(analysis?.steps.length === 1);
  assert.equal(analysis?.steps[0].token, 'MUD');
  assert.ok(analysis?.finalOutputValueDay > 0);
  assert.ok(analysis?.rawOpportunityCostDay >= 0);
});
