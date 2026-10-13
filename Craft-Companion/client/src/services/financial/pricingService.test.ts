import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  roundHalfUp,
  sumPrecise,
  calcProfit,
  marginPercentOnRevenue,
  markupPercentOnCost,
  roiPercent,
  percentChange,
  savingsPercentVs,
  coinToUsd,
  usdToCoin,
  resolveCoinUsdPrice,
  toFiniteNumber,
  isEffectivelyZero,
} from './pricingService';

test('roundHalfUp aplica política Half-Up corrigiendo imprecisión binaria', () => {
  assert.equal(roundHalfUp(1.005, 2), 1.01); // float nativo diría 1.00 con toFixed bien, pero half-up garantizado
  assert.equal(roundHalfUp(2.675, 2), 2.68);
  assert.equal(roundHalfUp(-1.005, 2), -1.01);
  assert.equal(roundHalfUp(0.499999, 0), 0);
  assert.equal(roundHalfUp(0.5, 0), 1);
  assert.equal(roundHalfUp(12345.6789), 12346);
  assert.equal(roundHalfUp(NaN, 2), 0);
  // -0 se normaliza a +0 para no filtrarse a la UI
  assert.equal(roundHalfUp(-0.4, 0), 0);
  assert.equal(Object.is(roundHalfUp(-0.4, 0), -0), false);
});

test('sumPrecise evita la deriva clásica 0.1 + 0.2', () => {
  // El float nativo acumula error: 0.1 + 0.2 !== 0.3
  assert.ok(Math.abs(0.1 + 0.2 - 0.3) > 1e-17);
  assert.equal(roundHalfUp(sumPrecise([0.1, 0.2]), 10), 0.3);
  const many = Array.from({ length: 1000 }, () => 0.1);
  assert.ok(Math.abs(sumPrecise(many) - 100) < 1e-10);
});

test('calcProfit y márgenes con denominadores estandarizados', () => {
  assert.equal(calcProfit(15, 10), 5);
  assert.equal(marginPercentOnRevenue(20, 10), 50);
  assert.equal(markupPercentOnCost(20, 10), 100);
  assert.equal(marginPercentOnRevenue(0, 10), null);
  assert.equal(markupPercentOnCost(20, 0), null);
  assert.equal(marginPercentOnRevenue(10, 15), -50);
});

test('roiPercent y percentChange manejan división por cero', () => {
  assert.equal(roiPercent(50, 200), 25);
  assert.equal(roiPercent(50, 0), null);
  assert.equal(percentChange(110, 100), 10);
  assert.equal(percentChange(90, 100), -10);
  assert.equal(percentChange(1, 0), null);
});

test('savingsPercentVs calcula ahorro contra la opción cara', () => {
  assert.equal(savingsPercentVs(0.1, 0.03), 70);
  assert.equal(savingsPercentVs(0, 5), null);
});

test('conversiones COIN/USD solo vía pricingService', () => {
  assert.equal(coinToUsd(1000, 0.0002105), 0.2105);
  assert.equal(roundHalfUp(usdToCoin(0.2105, 0.0002105), 6), 1000);
  assert.equal(coinToUsd(100, 0), 0);
  assert.equal(usdToCoin(1, 0), 0);
});

test('resolveCoinUsdPrice usa fallback solo cuando la tasa viva es inválida', () => {
  assert.equal(resolveCoinUsdPrice(0.0003, 0.0002105), 0.0003);
  assert.equal(resolveCoinUsdPrice(0, 0.0002105), 0.0002105);
  assert.equal(resolveCoinUsdPrice(null, 0.0002105), 0.0002105);
  assert.equal(resolveCoinUsdPrice(undefined, 0.0002105), 0.0002105);
  assert.equal(resolveCoinUsdPrice(NaN, 0.0002105), 0.0002105);
  assert.equal(resolveCoinUsdPrice(-5, 0.0002105), 0.0002105);
});

test('toFiniteNumber e isEffectivelyZero guardan la entrada numérica', () => {
  assert.equal(toFiniteNumber('1.5'), 1.5);
  assert.equal(toFiniteNumber('x', 7), 7);
  assert.equal(toFiniteNumber(Infinity), 0);
  assert.ok(isEffectivelyZero(0));
  assert.ok(isEffectivelyZero(1e-12));
  assert.ok(!isEffectivelyZero(0.004608));
  assert.ok(isEffectivelyZero(NaN));
});
