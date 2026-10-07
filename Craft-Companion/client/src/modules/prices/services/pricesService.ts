import type { MarketPriceItem } from '../types';

export function filterMarketPrices(
  prices: MarketPriceItem[],
  search: string,
): MarketPriceItem[] {
  if (!search || !search.trim()) return prices;
  const q = search.trim().toLowerCase();
  return (prices || []).filter((p) =>
    (p?.referenceSymbol || '').toLowerCase().includes(q),
  );
}

export function getRecommendationVariant(
  recommendation?: string,
): 'success' | 'danger' | 'neutral' {
  const norm = (recommendation || '').toUpperCase();
  if (norm === 'BUY') return 'success';
  if (norm === 'SELL') return 'danger';
  return 'neutral';
}
