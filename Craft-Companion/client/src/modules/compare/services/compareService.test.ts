import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { calculateComparisonVerdict } from './compareService';
import type { FactoryCycleResult } from '../../../services/craftworldCalculations';

const mockRow = {
  token: 'STEEL',
  level: 1,
  duration_min: 10,
  output_token: 'STEEL',
  output_amount: 1,
  input_token_1: '',
  input_amount_1: 0,
  input_token_2: '',
  input_amount_2: 0,
  upgrade_token: '',
  upgrade_amount: 0,
};

function createMockCycle(overrides: Partial<FactoryCycleResult> = {}): FactoryCycleResult {
  return {
    row: mockRow,
    factoryCount: 1,
    runtimeMinutes: 10,
    runsPerHour: 6,
    runsPerDay: 144,
    revenuePerCycle: 50,
    inputCostPerCycle: 20,
    profitPerCycle: 30,
    profitPerHour: 180,
    profitPerDay: 4320,
    marginPercent: 60,
    outputPerCycle: 1,
    outputPerHour: 6,
    outputPerDay: 144,
    input1PerCycle: 0,
    input2PerCycle: 0,
    xpPerCycle: 10,
    xpPerHour: 60,
    xpPerDay: 1440,
    xpPerCoin: null,
    powerCostPerCycle: 0,
    powerCostPerHour: 0,
    workshopBoostPercent: 0,
    activeBoostPercent: 0,
    activeBoostMultiplier: 1,
    masteryLevel: 0,
    masteryReductionPercent: 0,
    missingPrices: [],
    ...overrides,
  };
}

test('calculateComparisonVerdict returns null when either cycle is null', () => {
  assert.equal(calculateComparisonVerdict(null, null, false), null);
  assert.equal(calculateComparisonVerdict(createMockCycle(), null, false), null);
  assert.equal(calculateComparisonVerdict(null, createMockCycle(), false), null);
});

test('calculateComparisonVerdict identifies Option A as winner when profit is higher', () => {
  const cycleA = createMockCycle({ profitPerDay: 5000, outputPerDay: 200, xpPerDay: 2000, runtimeMinutes: 5 });
  const cycleB = createMockCycle({ profitPerDay: 3000, outputPerDay: 100, xpPerDay: 1000, runtimeMinutes: 10 });

  const verdict = calculateComparisonVerdict(cycleA, cycleB, true);
  assert.ok(verdict);
  assert.equal(verdict.profitWinner, 'A');
  assert.equal(verdict.profitDiffDay, 2000);
  assert.equal(verdict.outputWinner, 'A');
  assert.equal(verdict.outputDiffDay, 100);
  assert.equal(verdict.xpWinner, 'A');
  assert.equal(verdict.xpDiffDay, 1000);
  assert.equal(verdict.timeWinner, 'A'); // Faster duration is better
  assert.equal(verdict.isSameFactory, true);
});

test('calculateComparisonVerdict identifies Option B as winner when profit is higher', () => {
  const cycleA = createMockCycle({ profitPerDay: 2000, runtimeMinutes: 15 });
  const cycleB = createMockCycle({ profitPerDay: 4000, runtimeMinutes: 8 });

  const verdict = calculateComparisonVerdict(cycleA, cycleB, false);
  assert.ok(verdict);
  assert.equal(verdict.profitWinner, 'B');
  assert.equal(verdict.profitDiffDay, -2000);
  assert.equal(verdict.profitDiffAbs, 2000);
  assert.equal(verdict.timeWinner, 'B');
  assert.equal(verdict.isSameFactory, false);
});

test('calculateComparisonVerdict handles TIE conditions accurately', () => {
  const cycleA = createMockCycle({ profitPerDay: 3000, outputPerDay: 100, xpPerDay: 1000, runtimeMinutes: 10 });
  const cycleB = createMockCycle({ profitPerDay: 3000, outputPerDay: 100, xpPerDay: 1000, runtimeMinutes: 10 });

  const verdict = calculateComparisonVerdict(cycleA, cycleB, true);
  assert.ok(verdict);
  assert.equal(verdict.profitWinner, 'TIE');
  assert.equal(verdict.profitDiffDay, 0);
  assert.equal(verdict.outputWinner, 'TIE');
  assert.equal(verdict.xpWinner, 'TIE');
  assert.equal(verdict.timeWinner, 'TIE');
});
