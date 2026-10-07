import React from 'react';
import Card from '../../../components/Card';
import type { MarketPriceItem } from '../types';
import { PricesItemRow } from './PricesItemRow';

interface PricesGridProps {
  prices: MarketPriceItem[];
  language: string;
}

export const PricesGrid: React.FC<PricesGridProps> = ({ prices, language }) => {
  return (
    <Card
      title={
        language === 'es'
          ? `📊 Cotizaciones de Mercado (${prices.length})`
          : `📊 Market Prices (${prices.length})`
      }
    >
      {prices.length ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {prices.map((item, idx) => (
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
