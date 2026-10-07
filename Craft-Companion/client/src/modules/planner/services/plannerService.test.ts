import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  computeKpiStats,
  buildMaterialEntries,
  buildMissingClipboardText,
  extractCraftingSteps,
} from './plannerService';
import type { RecipeNode } from '../../../services/craftworldCalculations';

test('computeKpiStats calculates completion and deficit costs accurately', () => {
  const reqs = { WOOD: 100, IRON: 50 };
  const userStock = { WOOD: 40, IRON: 50 };
  const prices = { WOOD: 2, IRON: 5 };

  const stats = computeKpiStats(reqs, userStock, prices);

  assert.equal(stats.totalTypes, 2);
  assert.equal(stats.readyTypes, 1); // IRON is ready
  assert.equal(stats.missingTypes, 1); // WOOD missing
  assert.equal(stats.totalMissingItems, 60); // 100 - 40
  assert.equal(stats.totalMissingCost, 120); // 60 * 2
  assert.equal(stats.completionPercent, 50);
  assert.equal(stats.canCraftInstantly, false);
});

test('buildMaterialEntries filters entries by status', () => {
  const reqs = { WOOD: 100, IRON: 50 };
  const userStock = { WOOD: 40, IRON: 50 };
  const prices = { WOOD: 2, IRON: 5 };

  const all = buildMaterialEntries(reqs, userStock, prices, 'all');
  assert.equal(all.length, 2);

  const missing = buildMaterialEntries(reqs, userStock, prices, 'missing');
  assert.equal(missing.length, 1);
  assert.equal(missing[0].symbol, 'WOOD');
  assert.equal(missing[0].missing, 60);

  const ready = buildMaterialEntries(reqs, userStock, prices, 'ready');
  assert.equal(ready.length, 1);
  assert.equal(ready[0].symbol, 'IRON');
  assert.equal(ready[0].missing, 0);
});

test('buildMissingClipboardText formats clipboard message', () => {
  const reqsAllReady = { WOOD: 10 };
  const stockReady = { WOOD: 20 };
  const readyMsg = buildMissingClipboardText(reqsAllReady, stockReady, 'CHAIR', 1);
  assert.ok(readyMsg.includes('¡Tienes todos los recursos'));

  const reqsMissing = { WOOD: 10 };
  const stockEmpty = { WOOD: 2 };
  const missingMsg = buildMissingClipboardText(reqsMissing, stockEmpty, 'CHAIR', 1);
  assert.ok(missingMsg.includes('Faltantes'));
  assert.ok(missingMsg.includes('WOOD: 8 faltantes'));
});

test('extractCraftingSteps constructs steps bottom-up from recipe tree', () => {
  const tree: RecipeNode = {
    token: 'PLANK',
    amount: 10,
    row: {
      token: 'SAWMILL',
      level: 1,
      duration_min: 5,
      output_token: 'PLANK',
      output_amount: 5,
      input_token_1: 'WOOD',
      input_amount_1: 10,
      input_token_2: '',
      input_amount_2: 0,
      upgrade_token: '',
      upgrade_amount: 0,
    },
    children: [],
  };

  const steps = extractCraftingSteps(tree);
  assert.equal(steps.length, 1);
  assert.equal(steps[0].outputToken, 'PLANK');
  assert.equal(steps[0].cyclesNeeded, 2); // 10 / 5
  assert.equal(steps[0].totalTimeMin, 10); // 2 * 5
  assert.equal(steps[0].inputs[0].amount, 20); // 10 * 2
});
