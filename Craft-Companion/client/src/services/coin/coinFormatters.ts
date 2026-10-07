import type { EcosystemCurrency } from './coinTypes';

export function formatCoinPrice(price: number): string {
  if (price <= 0 || isNaN(price)) return '$0.000211';
  if (price < 0.001) {
    return `$${price.toFixed(6)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(2)}`;
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
