import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  calculateBoosterMultiplier,
  calculateWorkerReductionFactor,
  collectFactoryBoosters,
  formatRemainingTime,
  calculateRunTimerMetrics,
  extractActiveRuns,
  resolveRunWindow,
} from './factoryTimersService';
import type { ActiveRun } from '../types';

test('calculateBoosterMultiplier compone boosters vigentes y expira correctamente', () => {
  const now = 100000;
  const boosters = [
    { boostValue: 0.5, startTime: new Date(now - 1000).toISOString(), endTime: new Date(now + 1000).toISOString() },
    { boostValue: 0.8, startTime: new Date(now - 5000).toISOString(), endTime: new Date(now - 1000).toISOString() }, // expirado
    { boostValue: 0.5 }, // permanente
  ];

  // Boosters activos: 0.5 * 0.5 = 0.25
  assert.equal(calculateBoosterMultiplier(boosters, now), 0.25);
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

// Regresión con datos reales (cuenta Coquerokli, 2026-10-12): STEEL L11 lleva
// 292,6 min PERSONALIZADOS en el payload (532 min estáticos × 0,55 workshop 9).
// El timer NO debe volver a aplicar el workshop encima de la definición.
const STEEL_L11_PERSONALIZED_MS = 292.6 * 60000;
const steelHomeData = {
  craft: { workshop: [{ symbol: 'STEEL', level: 9 }] },
  purchases: {},
  craftWorld: {
    landPlots: [
      {
        name: 'P',
        areas: [
          {
            factories: [
              {
                // booster activo ×0.5
                boosters: [{ boostValue: 0.5 }],
                crafting: { startedAt: new Date(100000).toISOString(), currentRunLevel: 11 },
                factory: {
                  level: 11,
                  definition: {
                    id: 'STEEL',
                    displayName: 'STEEL',
                    // L11 → índice 10
                    levels: Array.from({ length: 10 }, () => ({})).concat([
                      { millisecondsPerCompletion: STEEL_L11_PERSONALIZED_MS },
                    ]),
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

test('extractActiveRuns NO reaplica el workshop sobre definiciones personalizadas', () => {
  const runs = extractActiveRuns(steelHomeData, [], 'es', 100000);
  assert.equal(runs.length, 1);
  // Nivel mostrado = convención del juego (payload + 1): payload 11 → "Nivel 12".
  assert.equal(runs[0].level, 12);
  // 292,6 min × 0,5 (booster) = 146,3 — lo que muestra el juego en vivo.
  assert.ok(Math.abs(runs[0].runtimeMinutes - 146.3) < 1e-9, `got ${runs[0].runtimeMinutes}`);
});

test('extractActiveRuns en fallback estático SÍ aplica la tabla oficial de workshop', () => {
  const staticRows = [
    {
      token: 'STEEL', level: 11, duration_min: 532, duration_raw: '8:52:00',
      output_token: 'STEEL', output_amount: 1, input_token_1: 'COPPER', input_amount_1: 4.25,
      input_token_2: '', input_amount_2: 0, upgrade_token: 'STEEL', upgrade_amount: 56,
    },
  ];
  // mismo payload pero SIN definition en la instancia (con id para resolver token)
  const noDef = JSON.parse(JSON.stringify(steelHomeData));
  const facRef = noDef.craftWorld.landPlots[0].areas[0].factories[0].factory;
  delete facRef.definition;
  facRef.id = 'STEEL';

  const runs = extractActiveRuns(noDef, staticRows, 'es', 100000);
  // 532 × (1−0.45) × 0.5 = 146.3 — paridad exacta con el path personalizado.
  assert.ok(Math.abs(runs[0].runtimeMinutes - 146.3) < 1e-9, `got ${runs[0].runtimeMinutes}`);
});

// Regresión 2026-10-13 (capturas del usuario): la MAESTRÍA también acelera el
// ciclo. Cuenta real: STEEL maestría 10 → ×0.95. Ciclo = 292,6 (payload
// personalizado) × 0,5 boost × 0,95 maestría = 138,99 min; el juego marcaba
// 2h11m restantes y la app (sin este factor) decía 2h16m53s.
test('extractActiveRuns aplica maestría a la DURACIÓN del ciclo además de a insumos', () => {
  const withMastery = JSON.parse(JSON.stringify(steelHomeData));
  withMastery.craft.proficiencies = [{ symbol: 'STEEL', claimedLevel: 10 }];
  const runs = extractActiveRuns(withMastery, [], 'es', 100000);
  assert.ok(Math.abs(runs[0].runtimeMinutes - 138.985) < 0.01, `got ${runs[0].runtimeMinutes}`);
});

test('collectFactoryBoosters no duplica el booster de parcela espejado en cada fábrica', () => {
  // Evidencia 2026-10-13: /me/craft-world refleja el MISMO objeto booster en
  // plot.booster y en factory.boosters (mismo boostValue/startTime/endTime).
  const booster = { boostValue: 0.5, startTime: '2026-10-01T00:00:00Z', endTime: '2026-10-13T00:00:00Z' };
  const plot = { booster };
  const area = {};
  const facObj = { boosters: [booster], consumableBoosters: [] };
  const collected = collectFactoryBoosters(plot, area, facObj);
  assert.equal(collected.length, 1); // no 2: sin dedup, ×0.5 se aplicaba dos veces (timers ×2 rápidos)
});

test('extractActiveRuns no corre el timer al doble por booster espejo parcela+fábrica', () => {
  const cloned = JSON.parse(JSON.stringify(steelHomeData));
  cloned.craftWorld.landPlots[0].booster = { boostValue: 0.5 }; // espejo a nivel parcela
  const runs = extractActiveRuns(cloned, [], 'es', 100000);
  // plot 0.5 espejado + instancia 0.5 => SIEMPRE ×0.5, nunca ×0.25
  assert.ok(Math.abs(runs[0].runtimeMinutes - 146.3) < 1e-9, `got ${runs[0].runtimeMinutes}`);
});

test('fábrica fantasma: ciclo terminado hace horas NO aparece produciendo', () => {
  // patrón SCREWS real: start hace 29h, 1 ciclo de ~5h, 1 unidad sin reclamar.
  const now = Date.parse('2026-10-13T03:00:00Z');
  const homeData = JSON.parse(JSON.stringify(steelHomeData));
  const crafting = homeData.craftWorld.landPlots[0].areas[0].factories[0].crafting;
  crafting.startedAt = '2026-10-11T22:33:00Z';
  crafting.unclaimedUnitsBeforeCurrentRun = 1;
  const runs = extractActiveRuns(homeData, [], 'es', now);
  assert.equal(runs[0].isProducing, false);
});

test('fábrica apilando unidades sin reclamar sigue produciendo y el contador apunta al ciclo en curso', () => {
  // patrón TILE real: 14 unidades apiladas, ciclo 90 min, entró hace 19 h.
  const now = Date.parse('2026-10-13T03:00:00Z');
  const homeData = JSON.parse(JSON.stringify(steelHomeData));
  const crafting = homeData.craftWorld.landPlots[0].areas[0].factories[0].crafting;
  homeData.craftWorld.landPlots[0].areas[0].factories[0].boosters = [];
  crafting.startedAt = '2026-10-12T08:00:00Z';
  crafting.unclaimedUnitsBeforeCurrentRun = 14;
  const runs = extractActiveRuns(homeData, [], 'es', now);
  // ciclo 292,6 min sin booster: 14 ciclos apilados → ciclo actual 15 termina a
  // 08:00 + 15×292,6min ≈ 13-13T08:19 → sigue produciendo y el inicio efectivo
  // se desplazó 14 ciclos.
  assert.equal(runs[0].isProducing, true);
  const shiftedMs = new Date(runs[0].startedAt).getTime();
  const expectedShift = 14 * 292.6 * 60000;
  assert.ok(Math.abs(shiftedMs - Date.parse(crafting.startedAt) - expectedShift) < 1, 'shift ~14 ciclos');
});

test('resolveRunWindow: sin unidades apiladas el inicio no se desplaza', () => {
  const r = resolveRunWindow({
    startedAt: '2026-10-13T00:00:00Z',
    unclaimedUnits: 0,
    outputPerCycle: 1,
    runtimeMinutes: 60,
    pausedAt: null,
    nowMs: Date.parse('2026-10-13T00:30:00Z'),
  });
  assert.equal(r.effectiveStartedAt, '2026-10-13T00:00:00.000Z');
  assert.equal(r.isProducing, true);
});

test('resolveRunWindow respeta outputPerCycle al contar ciclos apilados', () => {
  // 10 unidades con output 5/ciclo = 2 ciclos apilados (no 10)
  const r = resolveRunWindow({
    startedAt: '2026-10-13T00:00:00Z',
    unclaimedUnits: 10,
    outputPerCycle: 5,
    runtimeMinutes: 10,
    pausedAt: null,
    nowMs: Date.parse('2026-10-13T00:25:00Z'),
  });
  assert.equal(r.effectiveStartedAt, '2026-10-13T00:20:00.000Z');
  assert.equal(r.isProducing, true);
});
