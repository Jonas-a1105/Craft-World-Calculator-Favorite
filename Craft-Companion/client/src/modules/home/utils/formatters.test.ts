import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  displayNumber,
  formatShopItem,
  formatAdPlacement,
  formatBoosterName,
  formatEggName,
  formatUid,
} from './formatters';

test('displayNumber formats numeric values or returns dash', () => {
  assert.equal(displayNumber(0), (0).toLocaleString());
  assert.equal(displayNumber(1500), (1500).toLocaleString());
  assert.equal(displayNumber(null), '—');
  assert.equal(displayNumber(undefined), '—');
});

test('formatShopItem formats items in es and en', () => {
  assert.equal(formatShopItem('com.angrydynamiteslab.craftworld.proaccount', 'es'), '⭐ Cuenta Pro');
  assert.equal(formatShopItem('com.angrydynamiteslab.craftworld.proaccount', 'en'), '⭐ Pro Account');
  assert.equal(formatShopItem('com.angrydynamiteslab.craftworld.noadsoffer', 'es'), '🚫 Oferta Sin Anuncios');
  assert.equal(formatShopItem('com.angrydynamiteslab.craftworld.pack_gems', 'es'), 'pack gems');
});

test('formatAdPlacement formats placement identifiers', () => {
  assert.equal(formatAdPlacement('rewarded_mine_speed', 'es'), '⛏️ Booster Mina');
  assert.equal(formatAdPlacement('rewarded_factory_boost', 'en'), '⚡ Factory Booster');
  assert.equal(formatAdPlacement('other_ad_source', 'es'), 'other ad source');
});

test('formatBoosterName formats factory and mine boosts', () => {
  assert.equal(formatBoosterName('FACTORYBOOST_2X'), '⚡ 2X');
  assert.equal(formatBoosterName('MINEBOOST_SPEED'), '⛏️ SPEED');
});

test('formatEggName formats egg tiers correctly', () => {
  assert.equal(formatEggName('MID_DRAGON'), 'Medio DRAGON');
  assert.equal(formatEggName('HIGH_PHOENIX'), 'Alto PHOENIX');
  assert.equal(formatEggName('LOW_TIER'), 'Básico TIER');
});

test('formatUid shortens long UIDs safely', () => {
  assert.equal(formatUid(undefined), 'N/A');
  assert.equal(formatUid('12345'), '12345');
  assert.equal(formatUid('user_019f6f6c3dbc754aa0ab'), 'user_0...a0ab');
});
