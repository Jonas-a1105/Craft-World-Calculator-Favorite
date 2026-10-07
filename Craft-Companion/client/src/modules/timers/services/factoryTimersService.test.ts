import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  calculateBoosterMultiplier,
  calculateWorkerReductionFactor,
  formatRemainingTime,
  calculateRunTimerMetrics,
  extractActiveRuns,
} from './factoryTimersService';
import type { ActiveRun } from '../types';

test('calculateBoosterMultiplier compounds active valid boosters and no-ads bonus', () => {
  const now = 100000;
  const boosters = [
    { boostValue: 0.5, startTime: new Date(now - 1000).toISOString(), endTime: new Date(now + 1000).toISOString() },
    { boostValue: 0.8, startTime: new Date(now - 5000).toISOString(), endTime: new Date(now - 1000).toISOString() }, // expired
    { boostValue: 0.5 }, // permanent
  ];

  // Active boosters: 0.5 * 0.5 = 0.25
  const mult = calculateBoosterMultiplier(boosters, false, now);
  assert.equal(mult, 0.25);

  // With no ads (extra 0.5): 0.25 * 0.5 = 0.125
  const multNoAds = calculateBoosterMultiplier(boosters, true, now);
  assert.equal(multNoAds, 0.125);
});

test('calculateWorkerReductionFactor handles direct reduction factor and worker intervals', () => {
  // Direct reduction
  assert.equal(calculateWorkerReductionFactor(0.6415), 0.6415);

  // Worker intervals
  const workers = [{ boostValue: 0.1 }, { boostValue: 0.15 }];
  assert.equal(calculateWorkerReductionFactor(undefined, workers), 0.75);

  // Default fallback
  assert.equal(calculateWorkerReductionFactor(undefined, []), 1.0);
});

test('formatRemainingTime formats remaining hours, minutes and seconds cleanly', () => {
  assert.equal(formatRemainingTime(0), '0m 0s');
  assert.equal(formatRemainingTime(45), '0m 45s');
  assert.equal(formatRemainingTime(125), '2m 5s');
  assert.equal(formatRemainingTime(3665), '1h 1m 5s');
});

test('calculateRunTimerMetrics accurately calculates loop cycles when producing vs stopped', () => {
  const startedAt = new Date(1000000).toISOString();
  const runProducing: ActiveRun = {
    title: 'Acero',
    token: 'STEEL',
    outputToken: 'STEEL',
    outputAmount: 1,
    level: 1,
    startedAt,
    runtimeMinutes: 10, // 600s
    isProducing: true,
  };

  // 15 minutes elapsed = 900s. 1 full cycle completed (600s), 300s into next cycle. Remaining = 300s.
  const nowSynced = 1000000 + 900 * 1000;
  const metricsProducing = calculateRunTimerMetrics(runProducing, nowSynced);
  assert.equal(metricsProducing.runtimeSec, 600);
  assert.equal(metricsProducing.elapsedSec, 900);
  assert.equal(metricsProducing.completedCycles, 1);
  assert.equal(metricsProducing.cycleElapsed, 300);
  assert.equal(metricsProducing.remSec, 300);
  assert.equal(metricsProducing.percent, 50);
  assert.equal(metricsProducing.isFinished, false);

  // Run stopped: doesn't loop. If 900s elapsed for 600s job, it is finished.
  const runStopped: ActiveRun = {
    ...runProducing,
    isProducing: false,
  };
  const metricsStopped = calculateRunTimerMetrics(runStopped, nowSynced);
  assert.equal(metricsStopped.remSec, 0);
  assert.equal(metricsStopped.isFinished, true);
  assert.equal(metricsStopped.clampedPercent, 100);
});

test('extractActiveRuns parses landPlots and factory hierarchies accurately', () => {
  const homeData = {
    craftWorld: {
      landPlots: [
        {
          name: 'Parcela Norte',
          areas: [
            {
              factories: [
                {
                  factory: {
                    id: 'WATER_PUMP',
                    level: 1,
                    crafting: {
                      startedAt: new Date(100000).toISOString(),
                      currentRunLevel: 0,
                    },
                    definition: {
                      displayName: 'Bomba de Agua',
                      levels: [{ millisecondsPerCompletion: 300000 }],
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const runs = extractActiveRuns(homeData, [], 'es', 100000);
  assert.equal(runs.length, 1);
  assert.equal(runs[0].title, 'Bomba de Agua');
  assert.equal(runs[0].token, 'WATER_PUMP');
  assert.equal(runs[0].runtimeMinutes, 5); // 300000ms / 60000 = 5 min
  assert.equal(runs[0].isProducing, true);
});
