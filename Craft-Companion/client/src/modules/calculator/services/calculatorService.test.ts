import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  extractUniqueTokens,
  getAvailableLevels,
  resolveCurrentRow,
} from './calculatorService';
import type { FactoryDataRow } from '../types';

const mockRows: FactoryDataRow[] = [
  { token: 'STEEL', level: 1 } as any,
  { token: 'STEEL', level: 2 } as any,
  { token: 'STEEL', level: 5 } as any,
  { token: 'COPPER', level: 1 } as any,
  { token: 'COPPER', level: 3 } as any,
];

test('extractUniqueTokens returns deduplicated factory tokens', () => {
  const tokens = extractUniqueTokens(mockRows);
  assert.deepEqual(tokens, ['STEEL', 'COPPER']);
  assert.deepEqual(extractUniqueTokens([]), []);
});

test('getAvailableLevels returns sorted ascending levels for specified token', () => {
  const steelLevels = getAvailableLevels(mockRows, 'STEEL');
  assert.deepEqual(steelLevels, [1, 2, 5]);

  const copperLevels = getAvailableLevels(mockRows, 'COPPER');
  assert.deepEqual(copperLevels, [1, 3]);

  assert.deepEqual(getAvailableLevels(mockRows, 'UNKNOWN'), []);
});

test('resolveCurrentRow finds exact token and level or falls back to first matching token', () => {
  const exact = resolveCurrentRow(mockRows, 'STEEL', 2);
  assert.ok(exact !== undefined);
  assert.equal(exact?.token, 'STEEL');
  assert.equal(exact?.level, 2);

  const fallback = resolveCurrentRow(mockRows, 'STEEL', 99);
  assert.ok(fallback !== undefined);
  assert.equal(fallback?.token, 'STEEL');
  assert.equal(fallback?.level, 1);

  const notFound = resolveCurrentRow(mockRows, 'UNKNOWN', 1);
  assert.equal(notFound, undefined);
});
