import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  extractUniqueTokens,
  getAvailableLevels,
  resolveCurrentRow,
} from './calculatorService';
import type { FactoryDataRow } from '../types';

function mockFactoryRow(token: string, level: number): FactoryDataRow {
  return {
    token,
    level,
    duration_min: 10,
    output_token: token,
    output_amount: 1,
    input_token_1: '',
    input_amount_1: 0,
    input_token_2: '',
    input_amount_2: 0,
    upgrade_token: '',
    upgrade_amount: 0,
  };
}

const mockRows: FactoryDataRow[] = [
  mockFactoryRow('STEEL', 1),
  mockFactoryRow('STEEL', 2),
  mockFactoryRow('STEEL', 5),
  mockFactoryRow('COPPER', 1),
  mockFactoryRow('COPPER', 3),
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
