import type { ChartTimeframe, CoinChartPoint } from './coinTypes';
import { formatCoinPrice } from './coinFormatters';

export function generateSyntheticChart(
  timeframe: ChartTimeframe,
  basePrice: number,
): CoinChartPoint[] {
  const pointsCount =
    timeframe === '1H' ? 12 : timeframe === '24H' ? 24 : timeframe === '7D' ? 28 : 30;
  const now = Date.now();
  const stepMs =
    timeframe === '1H'
      ? 5 * 60 * 1000
      : timeframe === '24H'
      ? 60 * 60 * 1000
      : timeframe === '7D'
      ? 6 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  const result: CoinChartPoint[] = [];
  let curr = basePrice * (timeframe === '24H' ? 1.028 : 0.98);

  for (let i = pointsCount - 1; i >= 0; i--) {
    const time = now - i * stepMs;
    const date = new Date(time);
    const timeLabel =
      timeframe === '1H' || timeframe === '24H'
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    if (i === 0) {
      curr = basePrice;
    } else {
      // Natural price fluctuation anchored to base
      const noise = (Math.sin(i * 1.3) * 0.015 + Math.cos(i * 0.7) * 0.01) * basePrice;
      curr = Math.max(0.0001, curr + noise);
    }

    result.push({
      timestamp: time,
      timeLabel,
      price: curr,
      formattedPrice: formatCoinPrice(curr),
    });
  }

  return result;
}
