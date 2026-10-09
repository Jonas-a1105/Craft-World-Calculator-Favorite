import type { ChartPoint, ChartSeriesData, Timeframe } from '../modules/resources/types';

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
}

export interface MetricPeriodStats {
  average: number;
  median: number;
  ath: number;
  atl: number;
  history: PriceHistoryPoint[];
}

export interface PoolResourceItem {
  symbol: string;
  price1d: MetricPeriodStats;
  price7d: MetricPeriodStats;
  price30d: MetricPeriodStats;
  liquidity: {
    average: number;
    median: number;
    ath: number;
    atl: number;
  };
  coinRate: {
    average: number;
    median: number;
    ath: number;
    atl: number;
  };
}

export interface RoninPoolsDataset {
  updatedAt: string;
  resourceCount: number;
  resources: Record<string, PoolResourceItem>;
}

let cachedPools: RoninPoolsDataset | null = null;
let fetchPromise: Promise<RoninPoolsDataset | null> | null = null;

export async function fetchRoninPoolsData(): Promise<RoninPoolsDataset | null> {
  if (cachedPools) return cachedPools;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch('/data/ronin_pools.json');
      if (!res.ok) {
        console.warn(`Failed to fetch /data/ronin_pools.json: ${res.status}`);
        return null;
      }
      const data: RoninPoolsDataset = await res.json();
      cachedPools = data;
      return data;
    } catch (err) {
      console.warn('Error loading ronin_pools.json:', err);
      return null;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function getCachedResourcePool(symbol: string): PoolResourceItem | null {
  if (!cachedPools || !cachedPools.resources) return null;
  const upper = symbol.toUpperCase();
  return cachedPools.resources[upper] || null;
}

/**
 * Builds real SVG chart series from Ronin Katana pool timestamps and prices
 */
export function buildRealChartSeries(
  poolItem: PoolResourceItem,
  timeframe: Timeframe,
  liveCurrentPrice: number,
  language: 'es' | 'en'
): ChartSeriesData | null {
  let period: MetricPeriodStats | null = null;

  if (timeframe === '1D' || timeframe === '1H' || timeframe === '4H') {
    period = poolItem.price1d;
  } else if (timeframe === '1W') {
    period = poolItem.price7d;
  } else {
    period = poolItem.price30d;
  }

  if (!period || !period.history || period.history.length === 0) {
    return null;
  }

  // Filter out pools with all zero or invalid prices (e.g. inactive Katana pairs)
  const validPoints = period.history.filter((p) => typeof p.price === 'number' && p.price > 0);
  if (validPoints.length < 2) {
    return null;
  }

  let rawPoints = [...period.history];

  // Slice for 1H or 4H if in 1d view
  if (timeframe === '1H' && rawPoints.length > 3) {
    rawPoints = rawPoints.slice(-4);
  } else if (timeframe === '4H' && rawPoints.length > 8) {
    rawPoints = rawPoints.slice(-8);
  }

  const rawVals = rawPoints.map((p) => p.price);

  // Anchor to live current price only if it's within a realistic market spread of the pool history
  // (prevents combining disparate units or default fallback pricing that causes +5000% spikes)
  const lastHistoryPrice = rawVals[rawVals.length - 1] || 0;
  if (
    liveCurrentPrice > 0 &&
    lastHistoryPrice > 0 &&
    liveCurrentPrice >= lastHistoryPrice * 0.3 &&
    liveCurrentPrice <= lastHistoryPrice * 3.0
  ) {
    rawVals[rawVals.length - 1] = liveCurrentPrice;
  }

  const firstVal = rawVals.find((v) => v > 0) || rawVals[0] || liveCurrentPrice;
  const lastVal = rawVals[rawVals.length - 1] || liveCurrentPrice;
  const diff = lastVal - firstVal;
  const pct = firstVal > 0 ? (diff / firstVal) * 100 : 0;
  const isPositive = diff >= 0;

  const min = Math.min(...rawVals);
  const max = Math.max(...rawVals);
  const range = max - min || 1;

  const svgWidth = 800;
  const svgHeight = 220;
  const paddingY = 20;
  const count = rawPoints.length;

  const pts: ChartPoint[] = rawPoints.map((pt, idx) => {
    const val = rawVals[idx];
    const x = count > 1 ? (idx / (count - 1)) * svgWidth : svgWidth / 2;
    const normalizedY = (val - min) / range;
    const y = svgHeight - paddingY - normalizedY * (svgHeight - paddingY * 2);

    let timeFormatted = pt.timestamp;
    try {
      const d = new Date(pt.timestamp);
      if (!isNaN(d.getTime())) {
        timeFormatted =
          d.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }) +
          ', ' +
          d.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            month: 'short',
            day: 'numeric',
          });
      }
    } catch {}

    return { x, y, val, timeFormatted };
  });

  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${pts[0].x},${svgHeight} ${polyline} ${pts[pts.length - 1].x},${svgHeight}`;

  return {
    points: pts,
    polylinePoints: polyline,
    areaPoints: area,
    changeAbs: Math.abs(diff),
    changePercent: Math.abs(pct),
    isUp: isPositive,
  };
}
