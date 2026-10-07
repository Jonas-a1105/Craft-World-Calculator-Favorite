import React, { useMemo } from 'react';
import Card from '../../../components/Card';
import type { MarketPriceItem } from '../types';
import { PricesItemRow } from './PricesItemRow';
import { useAppStore } from '../../../store/useAppStore';

interface PricesGridProps {
  prices: MarketPriceItem[];
  language: string;
}

export const PricesGrid: React.FC<PricesGridProps> = ({ prices, language }) => {
  const favorites = useAppStore((state) => state.favorites);

  const sortedPrices = useMemo(() => {
    return [...prices].sort((a, b) => {
      const aFav = favorites.includes((a.referenceSymbol || '').toUpperCase());
      const bFav = favorites.includes((b.referenceSymbol || '').toUpperCase());
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [prices, favorites]);

  return (
    <Card
      title={
        language === 'es'
          ? `📊 Cotizaciones de Mercado (${prices.length})`
          : `📊 Market Prices (${prices.length})`
      }
    >
      {sortedPrices.length ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {sortedPrices.map((item, idx) => (
            <PricesItemRow
              key={item.referenceSymbol || idx}
              item={item}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-6">
          {language === 'es'
            ? 'No se encontraron precios que coincidan.'
            : 'No matching prices found.'}
        </p>
      )}
    </Card>
  );
};
