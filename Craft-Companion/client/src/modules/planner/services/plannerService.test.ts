import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  computeKpiStats,
  buildMaterialEntries,
  buildMissingClipboardText,
  extractCraftingSteps,
  extractBlueprintEntries,
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

test('extractBlueprintEntries generates entire production blueprint and make vs buy decisions', () => {
  const rows = [
    {
      token: 'STEEL_MILL',
      level: 1,
      duration_min: 60,
      output_token: 'STEEL',
      output_amount: 1,
      input_token_1: 'COPPER',
      input_amount_1: 5,
      input_token_2: '',
      input_amount_2: 0,
      upgrade_token: '',
      upgrade_amount: 0,
    },
    {
      token: 'COPPER_SMELTER',
      level: 1,
      duration_min: 30,
      output_token: 'COPPER',
      output_amount: 1,
      input_token_1: 'EARTH',
      input_amount_1: 20,
      input_token_2: '',
      input_amount_2: 0,
      upgrade_token: '',
      upgrade_amount: 0,
    },
  ];

  const prices = {
    EARTH: 0.1,
    COPPER: 3, // Crafting Copper takes 20 Earth = 2 COIN < 3 COIN market -> Best: CRAFT!
    STEEL: 10, // Crafting Steel takes 5 Copper = 15 COIN > 10 COIN market -> Best: BUY!
  };

  const userStock = {
    EARTH: 100,
    COPPER: 0,
    STEEL: 1,
  };

  const blueprint = extractBlueprintEntries(rows, 'STEEL', 10, userStock, prices, 'all');

  // Must contain all 3 resources of the chain: EARTH (base), COPPER (intermediate), STEEL (target)
  assert.equal(blueprint.length, 3);

  const earth = blueprint.find((b) => b.symbol === 'EARTH')!;
  assert.ok(earth);
  assert.equal(earth.isRawElement, true);
  assert.equal(earth.requiredQty, 1000); // 10 Steel * 5 Copper * 20 Earth
  assert.equal(earth.missing, 900); // 1000 - 100
  assert.equal(earth.recommendedAction, 'buy');

  const copper = blueprint.find((b) => b.symbol === 'COPPER')!;
  assert.ok(copper);
  assert.equal(copper.isCraftable, true);
  assert.equal(copper.requiredQty, 50); // 10 * 5
  assert.equal(copper.craftCostPerUnit, 2); // 20 * 0.1
  assert.equal(copper.unitPrice, 3);
  assert.equal(copper.recommendedAction, 'craft'); // 2 < 3 -> craft!

  const steel = blueprint.find((b) => b.symbol === 'STEEL')!;
  assert.ok(steel);
  assert.equal(steel.isTarget, true);
  assert.equal(steel.requiredQty, 10);
  assert.equal(steel.craftCostPerUnit, 15); // 5 * 3
  assert.equal(steel.unitPrice, 10);
  assert.equal(steel.recommendedAction, 'buy'); // 10 < 15 -> buy market!
});
