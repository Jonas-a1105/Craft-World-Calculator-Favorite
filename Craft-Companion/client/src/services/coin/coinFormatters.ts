import {
  DEFAULT_COIN_DATA,
  type ChartTimeframe,
  type CoinChartPoint,
  type EcosystemCurrency,
} from './coinTypes';
import { roundHalfUp } from '../financial/pricingService';

export function formatCoinPrice(price: number): string {
  // Fallback canónico: cotización por defecto del token COIN (única fuente).
  const safePrice = !isNaN(price) && price > 0 ? price : DEFAULT_COIN_DATA.priceUsd;
  // Redondeo Half-Up estandarizado por pricingService en todo el flujo.
  if (safePrice < 0.001) {
    return `$${roundHalfUp(safePrice, 6).toFixed(6)}`;
  }
  if (safePrice < 1) {
    return `$${roundHalfUp(safePrice, 4).toFixed(4)}`;
  }
  return `$${roundHalfUp(safePrice, 2).toFixed(2)}`;
}

export function formatPriceChange(percent: number): {
  isPositive: boolean;
  arrow: string;
  text: string;
} {
  const isPositive = percent >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const prefix = isPositive ? '+' : '-';
  const val = Math.abs(percent).toFixed(2);
  return {
    isPositive,
    arrow,
    text: `${arrow} ${prefix}${val}%`,
  };
}

export function formatCurrencyAmount(amount: number, currency: EcosystemCurrency): string {
  if (amount <= 0 || isNaN(amount)) return '0';

  if (currency === 'COIN') {
    if (amount >= 1000) {
      return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return amount.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }

  if (currency === 'RON') {
    if (amount < 0.01) {
      return amount.toLocaleString('en-US', { maximumFractionDigits: 6 });
    }
    return amount.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }

  // USD / USDC
  if (amount < 0.001) {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

/**
 * Mapea filas OHLCV crudas (cronológicas) a puntos de gráfico listos para la UI.
 * Solo transformación de presentación: etiquetas de tiempo y precio formateado.
 */
export function mapOhlcvToChartPoints(
  ohlcvRows: number[][],
  timeframe: ChartTimeframe,
): CoinChartPoint[] {
  return ohlcvRows.map(([sec, _open, _high, _low, close]) => {
    const timeMs = sec * 1000;
    const date = new Date(timeMs);
    const timeLabel =
      timeframe === '1H' || timeframe === '24H'
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return {
      timestamp: timeMs,
      timeLabel,
      price: close,
      formattedPrice: formatCoinPrice(close),
    };
  });
}
