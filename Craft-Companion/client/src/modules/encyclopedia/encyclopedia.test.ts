import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { getEarthMineProgression } from './services/earthMineProgression';
import { computeSummaryStats } from './services/progressionGenerator';
import {
  formatCompact,
  formatWithCommas,
  formatDuration,
  formatDurationDiff,
} from './utils/formatters';

test('formatters format correctly', () => {
  assert.equal(formatCompact(0), '0');
  assert.equal(formatCompact(28800), '28.8k');
  assert.equal(formatCompact(360000), '360k');
  assert.equal(formatCompact(1500000), '1.5M');

  assert.equal(formatWithCommas(18750), '18,750');
  assert.equal(formatWithCommas(60000), '60,000');

  assert.equal(formatDuration(15), '15s');
  assert.equal(formatDuration(31.3), '31.3s');
  assert.equal(formatDuration(60), '1m');
  assert.equal(formatDuration(75), '1m 15s');
  assert.equal(formatDuration(3600), '1h');
  assert.equal(formatDuration(4500), '1h 15m');
  assert.equal(formatDuration(14400), '4h');

  assert.equal(formatDurationDiff(16.3), '+16.3s');
  assert.equal(formatDurationDiff(180), '+3m');
});

test('earth mine progression has exactly 50 levels matching game dataset', () => {
  const levels = getEarthMineProgression();
  assert.equal(levels.length, 50);

  // Level 1
  assert.equal(levels[0].level, 1);
  assert.equal(levels[0].outputAmount, 5);
  assert.equal(levels[0].durationSeconds, 15);
  assert.equal(levels[0].power, 0);
  assert.equal(levels[0].prodPerDay, 28800);
  assert.equal(levels[0].upgradeCostToken, '');

  // Level 6 switches to Mud
  assert.equal(levels[5].level, 6);
  assert.equal(levels[5].upgradeCostToken, 'Mud');
  assert.equal(levels[5].isMaterialSwitch, true);

  // Level 7 switches to Sand
  assert.equal(levels[6].level, 7);
  assert.equal(levels[6].upgradeCostToken, 'Sand');
  assert.equal(levels[6].isMaterialSwitch, true);

  // Level 14 switches to Copper
  assert.equal(levels[13].level, 14);
  assert.equal(levels[13].upgradeCostToken, 'Copper');
  assert.equal(levels[13].isMaterialSwitch, true);

  // Level 25 switches to Steel
  assert.equal(levels[24].level, 25);
  assert.equal(levels[24].upgradeCostToken, 'Steel');
  assert.equal(levels[24].isMaterialSwitch, true);

  // Level 34 switches to Screws
  assert.equal(levels[33].level, 34);
  assert.equal(levels[33].upgradeCostToken, 'Screws');
  assert.equal(levels[33].isMaterialSwitch, true);

  // Level 47 switches to Dynamite
  assert.equal(levels[46].level, 47);
  assert.equal(levels[46].upgradeCostToken, 'Dynamite');
  assert.equal(levels[46].isMaterialSwitch, true);

  // Level 50 max values
  const lvl50 = levels[49];
  assert.equal(lvl50.level, 50);
  assert.equal(lvl50.outputAmount, 60000);
  assert.equal(lvl50.power, 7);
  assert.equal(lvl50.prodPerDay, 360000);
  assert.equal(lvl50.durationSeconds, 14400); // 4h
});

test('summary stats computation', () => {
  const levels = getEarthMineProgression();
  const stats = computeSummaryStats(levels);

  assert.equal(stats.maxLevel, 50);
  assert.equal(stats.prodPerDayAtMax, 360000);
  assert.equal(stats.powerAtMax, 7);
  assert.equal(stats.cycleDurationAtMaxSeconds, 14400);
});
