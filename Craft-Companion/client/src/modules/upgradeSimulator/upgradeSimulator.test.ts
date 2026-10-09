import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FACILITY_CATALOG,
  CATEGORY_TABS,
} from './data/upgradeSimulatorCatalog';
import {
  loadMinesData,
  calculateUpgradeRequirements,
  consolidateResources,
} from './services/upgradeSimulatorService';
import { loadFactoryData } from '../../services/factoryData';

test('FACILITY_CATALOG contains exactly 49 verified facilities across 9 categories', () => {
  assert.equal(FACILITY_CATALOG.length, 49);

  const categories = new Set(FACILITY_CATALOG.map((f) => f.category));
  assert.equal(categories.size, 9);
  assert.ok(categories.has('earth'));
  assert.ok(categories.has('water'));
  assert.ok(categories.has('fire'));
  assert.ok(categories.has('special'));
  assert.ok(categories.has('keys'));
  assert.ok(categories.has('nests'));
  assert.ok(categories.has('wraps'));
  assert.ok(categories.has('academy'));
  assert.ok(categories.has('construction'));
});

test('CATEGORY_TABS has 10 tabs including all', () => {
  assert.equal(CATEGORY_TABS.length, 10);
  assert.equal(CATEGORY_TABS[0].id, 'all');
});

test('calculateUpgradeRequirements calculates Earth Mine 1 -> 50 accurately matching Rawffle', async () => {
  const mineRows = await loadMinesData();
  const earthMine = FACILITY_CATALOG.find((f) => f.token === 'EARTH_MINE');
  assert.ok(earthMine);
  if (!earthMine) return;

  const reqs = calculateUpgradeRequirements(
    earthMine,
    1,
    50,
    1,
    [],
    mineRows,
    { MUD: 1.5, CLAY: 15, SAND: 0.5, COPPER: 12, STEEL: 45, SCREWS: 10, DYNAMITE: 250 },
  );

  const reqMap = Object.fromEntries(reqs.map((r) => [r.token, r.amount]));

  assert.equal(reqMap.MUD, 44);
  assert.equal(reqMap.CLAY, 3);
  assert.equal(reqMap.SAND, 151);
  assert.equal(reqMap.COPPER, 406);
  assert.equal(reqMap.STEEL, 559);
  assert.equal(reqMap.SCREWS, 1372);
  assert.equal(reqMap.DYNAMITE, 172);

  // Total coin should equal sum of amounts * unitPrices
  const totalCoin = reqs.reduce((sum, r) => sum + r.totalCoin, 0);
  assert.ok(totalCoin > 0);
});

test('calculateUpgradeRequirements calculates Mud 1 -> 50 accurately matching Rawffle', async () => {
  const factoryRows = await loadFactoryData();
  const mudMeta = FACILITY_CATALOG.find((f) => f.token === 'MUD');
  assert.ok(mudMeta);
  if (!mudMeta) return;

  const reqs = calculateUpgradeRequirements(
    mudMeta,
    1,
    50,
    1,
    factoryRows,
    [],
    {},
  );

  const reqMap = Object.fromEntries(reqs.map((r) => [r.token, r.amount]));

  assert.equal(reqMap.MUD, 9);
  assert.equal(reqMap.CLAY, 2);
  assert.equal(reqMap.SAND, 117);
  assert.equal(reqMap.COPPER, 405);
  assert.equal(reqMap.STEEL, 647);
  assert.equal(reqMap.SCREWS, 886);
});

test('calculateUpgradeRequirements multiplies requirements and costs by qty', async () => {
  const factoryRows = await loadFactoryData();
  const mudMeta = FACILITY_CATALOG.find((f) => f.token === 'MUD');
  assert.ok(mudMeta);
  if (!mudMeta) return;

  const reqs = calculateUpgradeRequirements(
    mudMeta,
    1,
    50,
    3, // Qty 3
    factoryRows,
    [],
    { MUD: 2.0 },
  );

  const mudReq = reqs.find((r) => r.token === 'MUD');
  assert.ok(mudReq);
  if (!mudReq) return;
  assert.equal(mudReq.amount, 9 * 3); // 27
  assert.equal(mudReq.totalCoin, 27 * 2.0); // 54
});

test('calculateUpgradeRequirements returns empty when fromLevel >= toLevel', async () => {
  const factoryRows = await loadFactoryData();
  const mudMeta = FACILITY_CATALOG.find((f) => f.token === 'MUD');
  assert.ok(mudMeta);
  if (!mudMeta) return;

  const reqs = calculateUpgradeRequirements(mudMeta, 50, 50, 1, factoryRows, [], {});
  assert.equal(reqs.length, 0);

  const reqs2 = calculateUpgradeRequirements(mudMeta, 50, 10, 1, factoryRows, [], {});
  assert.equal(reqs2.length, 0);
});

test('consolidateResources correctly aggregates multiple upgrade items', () => {
  const item1 = {
    requiredResources: [
      { token: 'SCREWS', amount: 100, unitPrice: 10, totalCoin: 1000 },
      { token: 'STEEL', amount: 50, unitPrice: 50, totalCoin: 2500 },
    ],
  };
  const item2 = {
    requiredResources: [
      { token: 'SCREWS', amount: 200, unitPrice: 10, totalCoin: 2000 },
      { token: 'COPPER', amount: 80, unitPrice: 15, totalCoin: 1200 },
    ],
  };

  const consolidated = consolidateResources([item1, item2]);
  const map = Object.fromEntries(consolidated.map((c) => [c.token, c]));

  assert.equal(map.SCREWS.totalAmount, 300);
  assert.equal(map.SCREWS.totalCostCoin, 3000);
  assert.equal(map.STEEL.totalAmount, 50);
  assert.equal(map.STEEL.totalCostCoin, 2500);
  assert.equal(map.COPPER.totalAmount, 80);
  assert.equal(map.COPPER.totalCostCoin, 1200);
});
