import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  MASTERPIECE_RESOURCES,
  MASTERPIECE_LEAGUES,
  CONTRIBUTION_TIERS,
} from './data/masterpieceData';
import {
  calculatePowerCost,
  calculateTotalCost,
  calculateEfficiency,
  computeEfficiencyList,
  computeTierContributions,
} from './services/masterpieceCalculator';

test('Masterpiece dataset contains exactly 23 verified resources', () => {
  assert.equal(MASTERPIECE_RESOURCES.length, 23, 'Must have exactly 23 masterpiece resources');

  for (const item of MASTERPIECE_RESOURCES) {
    assert.ok(item.symbol.length > 0, 'Resource symbol must not be empty');
    assert.ok(item.baseCrowns > 0, `Base crowns for ${item.symbol} must be positive`);
    assert.ok(item.basePower > 0, `Base power for ${item.symbol} must be positive`);
    assert.ok(item.baseMarketPriceEstimate > 0, `Market price estimate for ${item.symbol} must be positive`);
  }
});

test('Masterpiece leagues dataset contains 5 leagues with valid match targets', () => {
  assert.equal(MASTERPIECE_LEAGUES.length, 5, 'Must have exactly 5 leagues');
  const ids = MASTERPIECE_LEAGUES.map((l) => l.id);
  assert.deepEqual(ids, ['bronze', 'bronze2', 'silver', 'gold', 'platinum']);

  for (const league of MASTERPIECE_LEAGUES) {
    assert.ok(league.pointsTotal > league.pointsCurrent, 'Total target points must exceed current points');
    assert.ok(league.matchLabel.length > 0, 'Match label must not be empty');
  }
});

test('calculatePowerCost calculates correct COIN cost for given power', () => {
  // 100k power at 10.00 COIN/100k should be exactly 10.00 COIN
  const cost100k = calculatePowerCost(100_000, 10.0);
  assert.equal(cost100k, 10.0);

  // 600k power (Hydrogen) at 10.00 COIN/100k should be 60.00 COIN
  const costHydrogen = calculatePowerCost(600_000, 10.0);
  assert.equal(costHydrogen, 60.0);

  // With multiplier 2x
  const cost2x = calculatePowerCost(600_000, 10.0, 2);
  assert.equal(cost2x, 120.0);

  // Zero power or zero price
  assert.equal(calculatePowerCost(0, 10.0), 0);
  assert.equal(calculatePowerCost(100_000, 0), 0);
});

test('calculateTotalCost calculates sum of market price and power cost', () => {
  const marketPrice = 15_360;
  const powerCost = 60;
  const total = calculateTotalCost(marketPrice, powerCost);
  assert.equal(total, 15_420);

  // With 2x multiplier
  const total2x = calculateTotalCost(marketPrice, powerCost, 2);
  assert.equal(total2x, 30_780);
});

test('calculateEfficiency calculates crowns per COIN ratio accurately', () => {
  const crowns = 60_750_000;
  const totalCost = 15_960;
  const eff = calculateEfficiency(crowns, totalCost);
  // ~3806.39 Crowns / COIN
  assert.ok(eff > 3800 && eff < 3810);

  // Zero cost returns 0 safely
  assert.equal(calculateEfficiency(crowns, 0), 0);
});

test('computeEfficiencyList sorts descending and assigns ranks', () => {
  const list = computeEfficiencyList(
    MASTERPIECE_RESOURCES,
    {},
    10.0,
    {},
    1,
    'en',
  );

  assert.equal(list.length, 23);
  assert.equal(list[0].rank, 1);
  assert.equal(list[22].rank, 23);

  // Check strict descending order
  for (let i = 0; i < list.length - 1; i++) {
    assert.ok(
      list[i].efficiency >= list[i + 1].efficiency,
      `Item at ${i} (${list[i].symbol}: ${list[i].efficiency}) must have efficiency >= item at ${i + 1} (${list[i + 1].symbol}: ${list[i + 1].efficiency})`,
    );
  }

  // Top items should include Hydrogen/Oil/Acid and bottom should include Copper
  const topSymbols = list.slice(0, 5).map((x) => x.symbol);
  assert.ok(topSymbols.includes('HYDROGEN') || topSymbols.includes('OIL') || topSymbols.includes('ACID'));
  assert.equal(list[list.length - 1].symbol, 'COPPER');
});

test('computeTierContributions correctly scales requirements by tier factor', () => {
  const userContribs = { SCREWS: 308, LAVA: 54, GAS: 23 };

  // 250% tier (100% of gold baseline)
  const tier250 = computeTierContributions(MASTERPIECE_RESOURCES, '250%', userContribs);
  const screws250 = tier250.find((x) => x.symbol === 'SCREWS');
  assert.ok(screws250);
  assert.equal(screws250.required, 1000);
  assert.equal(screws250.contributed, 308);
  assert.equal(screws250.percent, 31); // 308 / 1000 = 31%

  // 100% tier (40% factor)
  const tier100 = computeTierContributions(MASTERPIECE_RESOURCES, '100%', userContribs);
  const screws100 = tier100.find((x) => x.symbol === 'SCREWS');
  assert.ok(screws100);
  assert.equal(screws100.required, 400);

  // 10% tier (4% factor)
  const tier10 = computeTierContributions(MASTERPIECE_RESOURCES, '10%', userContribs);
  const screws10 = tier10.find((x) => x.symbol === 'SCREWS');
  assert.ok(screws10);
  assert.equal(screws10.required, 40);
});

test('computeEfficiencyList supports custom units and power escalation brackets', () => {
  // Test Oxygen with 5 units and bracket index 2 (50 batch limit, 2900 power)
  const list = computeEfficiencyList(
    MASTERPIECE_RESOURCES,
    { OXYGEN: 0.05 },
    10.0,
    {},
    1,
    { OXYGEN: 5 },
    { OXYGEN: 2 },
    'en',
  );

  const oxygen = list.find((item) => item.symbol === 'OXYGEN');
  assert.ok(oxygen);
  assert.equal(oxygen.units, 5);
  assert.equal(oxygen.bracketIndex, 2);
  assert.equal(oxygen.power, 2900); // 3rd bracket step for Oxygen is 2900
  assert.equal(oxygen.totalCrowns, 230_000 * 5); // 230k base crowns * 5 units = 1,150,000
  assert.equal(oxygen.totalPower, 2900 * 5); // 2900 * 5 = 14500
});

