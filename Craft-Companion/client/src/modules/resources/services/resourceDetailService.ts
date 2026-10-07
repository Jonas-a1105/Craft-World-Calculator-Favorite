import { formatNumber } from '../../../utils/formatters';
import type {
  Timeframe,
  ActivityTrade,
  RawExecutionTrade,
  ChartPoint,
  ChartSeriesData,
} from '../types';

export const TIMEFRAME_CONFIG: Record<
  Timeframe,
  { numPoints: number; volatility: number; seedMultiplier: number; totalMs: number }
> = {
  '1H': { numPoints: 20, volatility: 0.015, seedMultiplier: 1.1, totalMs: 60 * 60 * 1000 },
  '4H': { numPoints: 24, volatility: 0.025, seedMultiplier: 2.2, totalMs: 4 * 60 * 60 * 1000 },
  '1D': { numPoints: 28, volatility: 0.045, seedMultiplier: 3.3, totalMs: 24 * 60 * 60 * 1000 },
  '1W': { numPoints: 32, volatility: 0.09, seedMultiplier: 4.4, totalMs: 7 * 24 * 60 * 60 * 1000 },
  '1M': { numPoints: 36, volatility: 0.16, seedMultiplier: 5.5, totalMs: 30 * 24 * 60 * 60 * 1000 },
  'MAX': { numPoints: 40, volatility: 0.25, seedMultiplier: 6.6, totalMs: 180 * 24 * 60 * 60 * 1000 },
};

export const TIMEFRAME_LABELS: Record<Timeframe, { es: string; en: string }> = {
  '1H': { es: 'Última hora', en: 'Last hour' },
  '4H': { es: 'Últimas 4 horas', en: 'Last 4 hours' },
  '1D': { es: 'Último día', en: 'Last day' },
  '1W': { es: 'Última semana', en: 'Last week' },
  '1M': { es: 'Último mes', en: 'Last month' },
  'MAX': { es: 'Histórico total', en: 'All time' },
};

export function formatShortAmount(val: number): string {
  if (val >= 1_000_000) {
    const m = (val / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 });
    return `${m}M`;
  }
  if (val >= 1_000) {
    const k = (val / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 });
    return `${k}k`;
  }
  return formatNumber(val, 2);
}

export function generateChartSeries(
  currentPrice: number,
  symbol: string,
  timeframe: Timeframe,
  language: 'es' | 'en',
  nowMs = Date.now(),
): ChartSeriesData {
  const config = TIMEFRAME_CONFIG[timeframe];
  const { numPoints, volatility, seedMultiplier, totalMs } = config;

  let symSeed = 0;
  for (let i = 0; i < symbol.length; i++) {
    symSeed = (symSeed * 31 + symbol.charCodeAt(i)) % 1000;
  }

  const rawVals: number[] = [];
  let prevVal = currentPrice * (1 - volatility * 0.7);

  for (let i = 0; i < numPoints; i++) {
    const pseudoNoise =
      Math.sin(i * 0.85 + symSeed * seedMultiplier) * 0.5 +
      Math.cos(i * 1.4 + symSeed) * 0.3 +
      Math.sin(i * 3.1) * 0.2;
    const step = currentPrice * volatility * pseudoNoise;
    const val = Math.max(0.0001, prevVal + step);
    rawVals.push(val);
    prevVal = val;
  }

  // Ensure last point matches current price
  rawVals[rawVals.length - 1] = currentPrice;

  const firstVal = rawVals[0];
  const diff = currentPrice - firstVal;
  const pct = firstVal > 0 ? (diff / firstVal) * 100 : 0;
  const isPositive = diff >= 0;

  const min = Math.min(...rawVals);
  const max = Math.max(...rawVals);
  const range = max - min || 1;

  const svgWidth = 800;
  const svgHeight = 220;
  const paddingY = 20;

  const pts: ChartPoint[] = rawVals.map((val, idx) => {
    const x = (idx / (numPoints - 1)) * svgWidth;
    const normalizedY = (val - min) / range;
    const y = svgHeight - paddingY - normalizedY * (svgHeight - paddingY * 2);

    const pointTime = new Date(nowMs - totalMs + (idx / (numPoints - 1)) * totalMs);
    const timeFormatted =
      pointTime.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }) +
      ', ' +
      pointTime.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });

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

export function extractActivityTrades(
  rawExecutions: RawExecutionTrade[] | undefined,
  symbol: string,
  currentPrice: number,
): ActivityTrade[] {
  if (Array.isArray(rawExecutions) && rawExecutions.length > 0) {
    const relevant = rawExecutions.filter(
      (e: RawExecutionTrade) =>
        e.trade?.input?.symbol === symbol ||
        e.trade?.output?.symbol === symbol ||
        e.quote?.input?.symbol === symbol ||
        e.quote?.output?.symbol === symbol,
    );

    if (relevant.length > 0) {
      return relevant.map((e: RawExecutionTrade, idx: number) => {
        const inSym = e.trade?.input?.symbol || e.quote?.input?.symbol || 'COIN';
        const inAmt = e.trade?.input?.amount || e.quote?.input?.amount || 0;
        const outSym = e.trade?.output?.symbol || e.quote?.output?.symbol || symbol;
        const outAmt = e.trade?.output?.amount || e.quote?.output?.amount || 0;
        const unitP = outAmt > 0 ? inAmt / outAmt : currentPrice;
        return {
          id: e.id || `trade-${idx}`,
          inSymbol: inSym,
          inAmount: formatShortAmount(inAmt),
          outSymbol: outSym,
          outAmount: formatShortAmount(outAmt),
          unitPrice: formatNumber(unitP, unitP < 0.01 ? 4 : 2),
          success: !e.errorReason,
        };
      });
    }
  }

  // Realistic fallback transactions
  const seeds = [
    { inCoin: 4500, outRes: 4500 / currentPrice, p: currentPrice * 1.01 },
    { inCoin: 5190, outRes: 5190 / currentPrice, p: currentPrice * 1.01 },
    { inCoin: 7920, outRes: 7920 / currentPrice, p: currentPrice },
    { inCoin: 7000, outRes: 7000 / currentPrice, p: currentPrice },
    { inCoin: 9040, outRes: 9040 / currentPrice, p: currentPrice * 1.01 },
    { inCoin: 1610, outRes: 1610 / currentPrice, p: currentPrice * 0.99 },
  ];

  return seeds.map((s, idx) => ({
    id: `mock-${idx}`,
    inSymbol: 'COIN',
    inAmount: formatShortAmount(s.inCoin),
    outSymbol: symbol,
    outAmount: formatShortAmount(s.outRes),
    unitPrice: formatNumber(s.p, s.p < 0.01 ? 4 : 2),
    success: true,
  }));
}
