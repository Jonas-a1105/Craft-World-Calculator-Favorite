import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { getSplashStatusText, resolveSplashRedirect } from './splashService';

test('getSplashStatusText returns initial phase message', () => {
  assert.equal(getSplashStatusText(0.1, 'es'), 'Iniciando protocolos de Craft World...');
  assert.equal(getSplashStatusText(0.1, 'en'), 'Initializing Craft World protocols...');
});

test('getSplashStatusText returns intermediate and completion messages', () => {
  assert.equal(getSplashStatusText(0.5, 'es'), 'Sincronizando fábricas y cadena de valor...');
  assert.equal(getSplashStatusText(0.8, 'en'), 'Connecting real-time quotes & Ronin network...');
  assert.equal(getSplashStatusText(1.0, 'es'), '¡Ecosistema listo! Entrando...');
  assert.equal(getSplashStatusText(1.0, 'en'), 'Ecosystem ready! Entering...');
});

test('resolveSplashRedirect safely routes to custom redirect when valid', () => {
  assert.equal(resolveSplashRedirect(false, '/empire-dashboard'), '/empire-dashboard');
  assert.equal(resolveSplashRedirect(true, '/profitability'), '/profitability');
});

test('resolveSplashRedirect rejects invalid or recursive redirect paths', () => {
  assert.equal(resolveSplashRedirect(true, 'https://malicious.com'), '/home');
  assert.equal(resolveSplashRedirect(false, '//external.domain'), '/');
  assert.equal(resolveSplashRedirect(true, '/splash'), '/home');
  assert.equal(resolveSplashRedirect(false, null), '/');
  assert.equal(resolveSplashRedirect(true, undefined), '/home');
});
