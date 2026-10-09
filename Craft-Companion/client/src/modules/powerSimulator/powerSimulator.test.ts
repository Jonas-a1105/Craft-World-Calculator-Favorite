import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  calculatePackStepCost,
  calculateCumulativePackCost,
  calculateCrystalPriceInCoin,
  calculateCrystalPassDiscount,
  calculatePassiveHourly,
  calculateEffectiveCoinPer100k,
  formatPower,
  formatCoin,
  generateCostComparisonRows,
  computePowerSimulatorSummary,
} from './services/powerCalculatorService';
import {
  AIRSTREAM_LEVELS,
  SUNFORGE_LEVELS,
  DEFAULT_MAX_CAPACITY,
  CRYSTAL_PRICE_USD,
} from './data/powerSimulatorData';

test('calculatePackStepCost scales progressively up to 5 purchases then caps', () => {
  // Base 50
  assert.equal(calculatePackStepCost(50, 1), 50);
  assert.equal(calculatePackStepCost(50, 2), 75);
  assert.equal(calculatePackStepCost(50, 3), 100);
  assert.equal(calculatePackStepCost(50, 4), 125);
  assert.equal(calculatePackStepCost(50, 5), 150);
  assert.equal(calculatePackStepCost(50, 6), 150); // capped at purchase 5 rate

  // Base 150
  assert.equal(calculatePackStepCost(150, 1), 150);
  assert.equal(calculatePackStepCost(150, 2), 225);
  assert.equal(calculatePackStepCost(150, 3), 300);
  assert.equal(calculatePackStepCost(150, 4), 375);
  assert.equal(calculatePackStepCost(150, 5), 450);
  assert.equal(calculatePackStepCost(150, 6), 450);
});

test('calculateCumulativePackCost computes cumulative sum correctly', () => {
  // 0 purchases
  assert.equal(calculateCumulativePackCost(50, 0), 0);

  // 1 purchase
  assert.equal(calculateCumulativePackCost(50, 1), 50);

  // 2 purchases: 50 + 75 = 125
  assert.equal(calculateCumulativePackCost(50, 2), 125);

  // 3 purchases: 50 + 75 + 100 = 225
  assert.equal(calculateCumulativePackCost(50, 3), 225);

  // 4 purchases: 50 + 75 + 100 + 125 = 350
  assert.equal(calculateCumulativePackCost(50, 4), 350);

  // 5 purchases: 350 + 150 = 500
  assert.equal(calculateCumulativePackCost(50, 5), 500);

  // 6 purchases: 500 + 150 = 650
  assert.equal(calculateCumulativePackCost(50, 6), 650);
});

test('calculatePassiveHourly computes exact production matching game data', () => {
  // Level 8 Airstream (175 power / 5min cycle = 12 cycles/h => 2100 power/h)
  const air8 = calculatePassiveHourly(AIRSTREAM_LEVELS, { level: 8, count: 1 });
  assert.equal(air8, 2100);

  // Level 8 Airstream with 3 count
  const air8x3 = calculatePassiveHourly(AIRSTREAM_LEVELS, { level: 8, count: 3 });
  assert.equal(air8x3, 6300);

  // Level 8 Sunforge (151200 power / 4h cycle = 0.25 cycles/h => 37800 power/h)
  const sun8 = calculatePassiveHourly(SUNFORGE_LEVELS, { level: 8, count: 1 });
  assert.equal(sun8, 37800);

  // Zero count or unowned level
  assert.equal(calculatePassiveHourly(AIRSTREAM_LEVELS, { level: 0, count: 1 }), 0);
  assert.equal(calculatePassiveHourly(AIRSTREAM_LEVELS, { level: 8, count: 0 }), 0);
});

test('computePowerSimulatorSummary calculates free power totals accurately', () => {
  const summary = computePowerSimulatorSummary(
    2100, // Airstream lv 8
    37800, // Sunforge lv 8
    {
      capacity: DEFAULT_MAX_CAPACITY,
      packs25PerDay: 0,
      packs50PerDay: 0,
      packs100PerDay: 0,
      activateCrystalPass: false,
    },
    0.0002279,
  );

  assert.equal(summary.freePowerHourly, 39900);
  assert.equal(summary.freePowerDaily, 957600);
  assert.equal(summary.totalDailyPower, 957600);
  assert.equal(summary.totalCrystalsDaily, 0);
  assert.equal(summary.effectiveTotalCostCoin, 0);
});

test('generateCostComparisonRows ranks methods by COIN/100k matching reference values', () => {
  // Using reference coinUsdPrice where crystalPriceCoin ≈ 25.0667
  const coinUsdPrice = CRYSTAL_PRICE_USD / 25.0667;
  const rows = generateCostComparisonRows(DEFAULT_MAX_CAPACITY, coinUsdPrice);

  assert.equal(rows.length, 6);

  // Row 1 should be Power Pack +100% #1 and marked as cheapest
  assert.equal(rows[0].label, 'Power Pack +100% #1');
  assert.equal(rows[0].isCheapest, true);
  assert.ok(rows[0].coinPer100k !== null);
  assert.ok(Math.abs((rows[0].coinPer100k ?? 0) - 44.46) < 0.1);

  // Row 2 should be Power Pack +25% #1
  assert.equal(rows[1].label, 'Power Pack +25% #1');
  assert.ok(rows[1].coinPer100k !== null);
  assert.ok(Math.abs((rows[1].coinPer100k ?? 0) - 59.28) < 0.1);

  // Last row should be Power Pack +25% #3 at ~118.56
  assert.equal(rows[rows.length - 1].label, 'Power Pack +25% #3');
  assert.ok(rows[rows.length - 1].coinPer100k !== null);
  assert.ok(Math.abs((rows[rows.length - 1].coinPer100k ?? 0) - 118.56) < 0.1);
});

test('calculateCrystalPassDiscount applies discount up to 150 crystals only', () => {
  const coinUsdPrice = 0.0002;

  // Inactive sub
  const noSub = calculateCrystalPassDiscount(200, coinUsdPrice, false);
  assert.equal(noSub, 0);

  // Active sub with 100 crystals
  const sub100 = calculateCrystalPassDiscount(100, coinUsdPrice, true);
  assert.ok(sub100 > 0);

  // Active sub with 200 crystals (caps at 150)
  const sub150 = calculateCrystalPassDiscount(150, coinUsdPrice, true);
  const sub200 = calculateCrystalPassDiscount(200, coinUsdPrice, true);
  assert.equal(sub150, sub200);
});

test('formatPower and formatCoin format values without clutter', () => {
  assert.equal(formatPower(0), '0');
  assert.equal(formatPower(2100), '2.1k');
  assert.equal(formatPower(37800), '37.8k');
  assert.equal(formatPower(8450000), '8.45M');

  assert.equal(formatCoin(null), '—');
  assert.equal(formatCoin(0), '0');
  assert.equal(formatCoin(1250), '1.25k');
  assert.equal(formatCoin(44.46), '44.46');
});
