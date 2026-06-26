/**
 * usePriceHistory.ts — Compute price deltas using rawrtools' built-in historical data
 * 
 * The rawrtools API already provides prices1h and prices24h snapshots,
 * so we can compute accurate deltas without maintaining our own localStorage history.
 * We keep a minimal localStorage cache as fallback for when rawrtools historical data
 * is unavailable.
 */

import { useEffect, useMemo, useRef } from 'react';
import type { TokenPrices } from '../utils/priceService';

export interface PriceDeltas {
  [symbol: string]: {
    delta1h: number | null;   // percentage change over 1 hour
    delta24h: number | null;  // percentage change over 24 hours
  };
}

interface PriceSnapshot {
  timestamp: number;
  prices: Record<string, number>;
}

const STORAGE_KEY = 'cw-price-history';
const MAX_AGE_MS = 25 * 60 * 60 * 1000; // 25 hours
const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000; // save every 5 min max

function loadSnapshots(): PriceSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveSnapshots(snapshots: PriceSnapshot[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch { /* ignore */ }
}

function findClosestSnapshot(snapshots: PriceSnapshot[], targetAgoMs: number): PriceSnapshot | null {
  const targetTime = Date.now() - targetAgoMs;
  let closest: PriceSnapshot | null = null;
  let minDiff = Infinity;

  for (const snap of snapshots) {
    const diff = Math.abs(snap.timestamp - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = snap;
    }
  }

  const tolerance = targetAgoMs * 0.3;
  if (closest && minDiff <= tolerance) return closest;
  return null;
}

/**
 * Computes price deltas for all tokens using browser localStorage snapshots.
 * 
 * @param prices - Current token prices
 */
export function usePriceHistory(
  prices: TokenPrices
): PriceDeltas {
  const lastSavedRef = useRef<number>(0);

  // Save local snapshots
  useEffect(() => {
    if (!prices || Object.keys(prices).length === 0) return;

    const now = Date.now();
    if (now - lastSavedRef.current < SNAPSHOT_INTERVAL_MS) return;
    lastSavedRef.current = now;

    const priceMap: Record<string, number> = {};
    for (const [symbol, data] of Object.entries(prices)) {
      priceMap[symbol] = data.buy;
    }

    let snapshots = loadSnapshots();
    const cutoff = Date.now() - MAX_AGE_MS;
    snapshots = snapshots.filter(s => s.timestamp > cutoff);
    snapshots.push({ timestamp: now, prices: priceMap });
    saveSnapshots(snapshots);
  }, [prices]);

  const deltas = useMemo((): PriceDeltas => {
    const result: PriceDeltas = {};
    if (!prices || Object.keys(prices).length === 0) return result;

    // Load local snapshots
    const snapshots = loadSnapshots();
    const localSnap1h = findClosestSnapshot(snapshots, 60 * 60 * 1000);
    const localSnap24h = findClosestSnapshot(snapshots, 24 * 60 * 60 * 1000);

    for (const symbol of Object.keys(prices)) {
      const currentPrice = prices[symbol]?.buy || 0;
      let delta1h: number | null = null;
      let delta24h: number | null = null;

      // 1h delta: using local snapshot
      const price1h = localSnap1h?.prices[symbol];
      if (price1h && price1h > 0 && currentPrice > 0) {
        delta1h = ((currentPrice - price1h) / price1h) * 100;
      }

      // 24h delta: using local snapshot
      const price24h = localSnap24h?.prices[symbol];
      if (price24h && price24h > 0 && currentPrice > 0) {
        delta24h = ((currentPrice - price24h) / price24h) * 100;
      }

      result[symbol] = { delta1h, delta24h };
    }

    return result;
  }, [prices]);

  return deltas;
}
