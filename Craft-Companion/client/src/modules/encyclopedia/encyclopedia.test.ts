import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { getEarthMineProgression } from './services/earthMineProgression';
import { computeSummaryStats, fetchProgressionForItem } from './services/progressionGenerator';
import { RESOURCE_ITEMS, BUILDING_ITEMS } from './data/catalog';
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

test('fetchProgressionForItem loads real static game data for Mud and Acid', async () => {
  const mudItem = RESOURCE_ITEMS.find((i) => i.id === 'MUD');
  assert.ok(mudItem, 'Mud item must exist in catalog');

  const mudLevels = await fetchProgressionForItem(mudItem);
  assert.equal(mudLevels.length, 50, 'Mud must have 50 extracted levels');

  // Verify Level 1 Mud
  const mud1 = mudLevels[0];
  assert.equal(mud1.level, 1);
  assert.equal(mud1.outputAmount, 1);
  assert.equal(mud1.input1Token, 'EARTH');
  assert.equal(mud1.input1Amount, 3);
  assert.equal(mud1.upgradeCostToken, 'EARTH');
  assert.equal(mud1.upgradeCostAmount, 1);
  assert.equal(mud1.prodPerDay, 8640);
  assert.equal(mud1.power, 0);

  // Verify Acid factory
  const acidItem = RESOURCE_ITEMS.find((i) => i.id === 'ACID');
  assert.ok(acidItem, 'Acid item must exist in catalog');

  const acidLevels = await fetchProgressionForItem(acidItem);
  assert.equal(acidLevels.length, 10, 'Acid must have 10 extracted levels');

  const acid1 = acidLevels[0];
  assert.equal(acid1.level, 1);
  assert.equal(acid1.power, 297500, 'Acid power cost must be 297,500');
  assert.equal(acid1.xpPerOutput, 4000000);
  assert.equal(acid1.input1Token, 'FUEL');
  assert.equal(acid1.input2Token, 'SCREWS');
});

test('fetchProgressionForItem correctly loads Paperwrap and Water', async () => {
  const paperwrapItem = RESOURCE_ITEMS.find((i) => i.id === 'PAPERWRAP');
  assert.ok(paperwrapItem, 'Paperwrap item must exist in catalog');

  const paperwrapLevels = await fetchProgressionForItem(paperwrapItem);
  assert.equal(paperwrapLevels.length, 35, 'Paperwrap must have 35 extracted levels');

  const waterItem = RESOURCE_ITEMS.find((i) => i.id === 'WATER');
  assert.ok(waterItem, 'Water item must exist in catalog');

  const waterLevels = await fetchProgressionForItem(waterItem);
  assert.equal(waterLevels.length, 40, 'Water must have 40 extracted levels');
});

test('buildings correctly load real spreadsheet progression data', async () => {
  const townHall = BUILDING_ITEMS.find((b) => b.id === 'TOWN_HALL');
  assert.ok(townHall, 'Town Hall must exist in building catalog');
  const thLevels = await fetchProgressionForItem(townHall);
  assert.equal(thLevels.length, 11, 'Town Hall must load exactly 11 levels (0-10) from sheet');
  assert.equal(thLevels[0].level, 0);
  assert.equal(thLevels[10].level, 10);

  const airstream = BUILDING_ITEMS.find((b) => b.id === 'AIRSTREAM');
  assert.ok(airstream, 'Airstream must exist in building catalog');
  const airLevels = await fetchProgressionForItem(airstream);
  assert.equal(airLevels.length, 15, 'Airstream must load 15 levels from sheet');

  const workshop = BUILDING_ITEMS.find((b) => b.id === 'WORKSHOP');
  assert.ok(workshop, 'Workshop must exist in building catalog');
  const wsLevels = await fetchProgressionForItem(workshop);
  assert.equal(wsLevels.length, 76, 'Workshop must load 76 levels (0-75) from sheet');
});

test('official events catalog loads authentic spreadsheet and event data', () => {
  const { OFFICIAL_EVENTS, getEventByCatalogId } = require('./data/eventsCatalog');
  const { EVENT_ITEMS } = require('./data/catalog');

  assert.equal(OFFICIAL_EVENTS.length, 3, 'Must contain 3 official Masterpiece events');
  assert.equal(EVENT_ITEMS.length, 3, 'Must contain 3 event catalog items');

  const fishingEvent = getEventByCatalogId('event-fishing-frenzy');
  assert.ok(fishingEvent, 'Fishing Frenzy event must be found');
  assert.equal(fishingEvent.prizeSymbol, '$FISH');
  assert.equal(fishingEvent.poolFactor, '70%');
  assert.equal(fishingEvent.recipes.length, 9, 'Fishing Frenzy must include 9 coastal recipes');
  assert.equal(fishingEvent.recipes[0].symbol, 'DYNOFISH');
  assert.equal(fishingEvent.recipes[8].symbol, 'LOBSTER');

  const axieEvent = getEventByCatalogId('event-axie-infinity');
  assert.ok(axieEvent, 'Axie event must be found');
  assert.equal(axieEvent.prizeSymbol, '$AXS');
  assert.equal(axieEvent.poolFactor, '80%');

  const ronkeEvent = getEventByCatalogId('event-ronke-moku');
  assert.ok(ronkeEvent, 'Ronke event must be found');
  assert.equal(ronkeEvent.prizeSymbol, '$RICE');
  assert.equal(ronkeEvent.poolFactor, '69%');
});
