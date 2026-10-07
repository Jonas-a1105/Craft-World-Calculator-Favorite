import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  formatPlotName,
  formatBuildingType,
  calculateEmpireOverviewStats,
  summarizeBuildings,
  extractPlotFactorySummary,
} from './empireService';

test('formatPlotName localizes recognized plot names', () => {
  assert.equal(formatPlotName('EARTH_PLOT_1', 'es'), 'Parcela de Tierra');
  assert.equal(formatPlotName('FLEXIBLE_PLOT_2', 'es'), 'Parcela Flexible');
  assert.equal(formatPlotName('BLUEPRINT_PLOT_A', 'es'), 'Parcela de Planos A');
  assert.equal(formatPlotName('CUSTOM_PLOT', 'en'), 'CUSTOM PLOT');
  assert.equal(formatPlotName('', 'es'), 'Parcela');
});

test('formatBuildingType formats bilingual names', () => {
  assert.equal(formatBuildingType('POWER_PLANT', 'es'), 'Planta de Poder');
  assert.equal(formatBuildingType('POWER_PLANT', 'en'), 'Power Plant');
  assert.equal(formatBuildingType('WORKSHOP', 'es'), 'Taller');
  assert.equal(formatBuildingType('UNKNOWN_BUILDING', 'en'), 'UNKNOWN BUILDING');
  assert.equal(formatBuildingType('', 'es'), '');
});

test('calculateEmpireOverviewStats aggregates plots, factories, workers and eggs/dynos', () => {
  const mockData = {
    craftWorld: {
      landPlots: [
        { areas: [{ factories: [{}, {}] }] },
        { areas: [{ factories: [{}] }] },
      ],
      dynos: [{}, {}],
      workers: [{}, {}, {}],
    },
    inventory: {
      eggs: [{ amount: 5 }, { amount: 3 }],
    },
  };

  const statsWithDynos = calculateEmpireOverviewStats(mockData);
  assert.equal(statsWithDynos.totalPlots, 2);
  assert.equal(statsWithDynos.totalFactories, 3);
  assert.equal(statsWithDynos.totalWorkers, 3);
  assert.equal(statsWithDynos.dynosOrEggsText, '2');

  const statsWithoutDynos = calculateEmpireOverviewStats({
    ...mockData,
    craftWorld: { ...mockData.craftWorld, dynos: [] },
  });
  assert.equal(statsWithoutDynos.dynosOrEggsText, '8 🥚');
});

test('summarizeBuildings groups buildings by type and calculates maxLevel', () => {
  const buildings = [
    { type: 'HOUSE', level: 2 },
    { type: 'HOUSE', level: 5 },
    { type: 'VAULT', level: 1 },
  ];

  const summary = summarizeBuildings(buildings);
  assert.equal(summary['HOUSE'].count, 2);
  assert.equal(summary['HOUSE'].maxLevel, 5);
  assert.deepEqual(summary['HOUSE'].levels, [2, 5]);

  assert.equal(summary['VAULT'].count, 1);
  assert.equal(summary['VAULT'].maxLevel, 1);
});

test('extractPlotFactorySummary groups unique factory counts on plot', () => {
  const plot = {
    areas: [
      {
        factories: [
          { factory: { definition: { id: 'STEEL_MILL' } } },
          { id: 'STEEL_MILL' },
          { id: 'WATER_PUMP' },
        ],
      },
    ],
  };

  const result = extractPlotFactorySummary(plot);
  assert.equal(result.factories.length, 3);
  assert.equal(result.counts['STEEL_MILL'], 2);
  assert.equal(result.counts['WATER_PUMP'], 1);
});
