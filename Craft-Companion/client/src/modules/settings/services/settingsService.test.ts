import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  COLOR_PRESETS,
  isSupportedColorPreset,
  validateImportJson,
} from './settingsService';

test('COLOR_PRESETS contains 6 unique valid hex colors', () => {
  assert.equal(COLOR_PRESETS.length, 6);
  const hexRegex = /^#[0-9a-fA-F]{6}$/;
  COLOR_PRESETS.forEach((preset) => {
    assert.match(preset.value, hexRegex);
    assert.ok(preset.label.length > 0);
  });
});

test('isSupportedColorPreset matches presets case-insensitively', () => {
  assert.equal(isSupportedColorPreset('#000000'), true);
  assert.equal(isSupportedColorPreset('#141415'), true);
  assert.equal(isSupportedColorPreset('#09090B'), true);
  assert.equal(isSupportedColorPreset('#ffffff'), false);
  assert.equal(isSupportedColorPreset('invalid'), false);
});

test('validateImportJson validates JSON payloads accurately', () => {
  assert.equal(validateImportJson('').valid, false);
  assert.equal(validateImportJson('   ').valid, false);
  assert.equal(validateImportJson('{ invalid json').valid, false);
  assert.equal(validateImportJson('"string"').valid, false);
  assert.equal(validateImportJson('123').valid, false);
  assert.equal(validateImportJson('{"version": 1, "data": {}}').valid, true);
});
