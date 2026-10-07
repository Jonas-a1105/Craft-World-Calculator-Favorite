import type { FactoryDataRow } from '../types';

export function extractUniqueTokens(rows: FactoryDataRow[]): string[] {
  if (!rows || rows.length === 0) return [];
  return Array.from(new Set(rows.map((r) => r.token)));
}

export function getAvailableLevels(rows: FactoryDataRow[], token: string): number[] {
  if (!rows || rows.length === 0 || !token) return [];
  return rows
    .filter((r) => r.token === token)
    .map((r) => r.level)
    .sort((a, b) => a - b);
}

export function resolveCurrentRow(
  rows: FactoryDataRow[],
  token: string,
  level: number,
): FactoryDataRow | undefined {
  if (!rows || rows.length === 0) return undefined;
  return (
    rows.find((r) => r.token === token && r.level === level) ||
    rows.find((r) => r.token === token)
  );
}
