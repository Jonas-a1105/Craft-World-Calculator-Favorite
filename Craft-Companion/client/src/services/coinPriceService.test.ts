import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  formatCoinPrice,
  formatPriceChange,
  convertEcosystemCurrency,
  formatCurrencyAmount,
  generateSyntheticChart,
  DEFAULT_COIN_DATA,
  GECKOTERMINAL_RONIN_COIN_POOL,
  GECKOTERMINAL_POOL_URL,
} from './coinPriceService';

test('formatCoinPrice formats sub-cent prices with 6 decimals', () => {
  assert.equal(formatCoinPrice(0.000211), '$0.000211');
  assert.equal(formatCoinPrice(0.000045), '$0.000045');
  assert.equal(formatCoinPrice(0.00021), '$0.000210');
});

test('formatCoinPrice formats standard and fallback prices accurately', () => {
  assert.equal(formatCoinPrice(0), '$0.000211');
  assert.equal(formatCoinPrice(-5), '$0.000211');
  assert.equal(formatCoinPrice(0.05), '$0.0500');
  assert.equal(formatCoinPrice(1.25), '$1.25');
});

test('formatPriceChange formats positive percentage with up arrow and plus', () => {
  const result = formatPriceChange(0.04);
  assert.equal(result.isPositive, true);
  assert.equal(result.arrow, '▲');
  assert.equal(result.text, '▲ +0.04%');
});

test('formatPriceChange formats negative percentage with down arrow and minus', () => {
  const result = formatPriceChange(-3.38);
  assert.equal(result.isPositive, false);
  assert.equal(result.arrow, '▼');
  assert.equal(result.text, '▼ -3.38%');
});

test('convertEcosystemCurrency converts bidirectionally across COIN, USD, USDC and RON', () => {
  const customData = {
    ...DEFAULT_COIN_DATA,
    priceUsd: 0.0002, // 1 COIN = $0.0002
    quotePriceUsd: 0.05, // 1 RON = $0.05
  };

  // COIN -> USD: 10,000 * 0.0002 = 2.00
  assert.equal(convertEcosystemCurrency(10000, 'COIN', 'USD', customData), 2);

  // USD -> COIN: 2.00 / 0.0002 = 10,000
  assert.equal(convertEcosystemCurrency(2, 'USD', 'COIN', customData), 10000);

  // COIN -> USDC: identical to USD
  assert.equal(convertEcosystemCurrency(50000, 'COIN', 'USDC', customData), 10);

  // USDC -> COIN:
  assert.equal(convertEcosystemCurrency(10, 'USDC', 'COIN', customData), 50000);

  // COIN -> RON: 10,000 COIN = $2 USD; $2 / $0.05 (RON) = 40 RON
  assert.equal(convertEcosystemCurrency(10000, 'COIN', 'RON', customData), 40);

  // RON -> COIN: 40 RON = $2 USD; $2 / 0.0002 = 10,000 COIN
  assert.equal(convertEcosystemCurrency(40, 'RON', 'COIN', customData), 10000);

  // Identity conversion
  assert.equal(convertEcosystemCurrency(1234, 'COIN', 'COIN', customData), 1234);
  assert.equal(convertEcosystemCurrency(50, 'RON', 'RON', customData), 50);

  // Zero and negative handling
  assert.equal(convertEcosystemCurrency(0, 'COIN', 'USD', customData), 0);
  assert.equal(convertEcosystemCurrency(-100, 'COIN', 'USD', customData), 0);
});

test('formatCurrencyAmount formats amounts per currency rules', () => {
  assert.equal(formatCurrencyAmount(0, 'COIN'), '0');
  assert.equal(formatCurrencyAmount(50000, 'COIN'), '50,000');
  assert.equal(formatCurrencyAmount(12.5, 'RON'), '12.5');
  assert.equal(formatCurrencyAmount(10.5, 'USD'), '10.50');
  assert.equal(formatCurrencyAmount(0.00021, 'USD'), '0.00021');
});

test('generateSyntheticChart generates sequential chronological points', () => {
  const points24H = generateSyntheticChart('24H', 0.00021);
  assert.equal(points24H.length, 24);
  assert.ok(points24H[0].timestamp < points24H[points24H.length - 1].timestamp);
  assert.equal(points24H[points24H.length - 1].price, 0.00021);
});

test('GeckoTerminal constants reference correct Ronin pool', () => {
  assert.equal(GECKOTERMINAL_RONIN_COIN_POOL, '0xda021b3d91f82bf2bcfc1a8709545c3a643d47de');
  assert.ok(GECKOTERMINAL_POOL_URL.includes('0xda021b3d91f82bf2bcfc1a8709545c3a643d47de'));
});
