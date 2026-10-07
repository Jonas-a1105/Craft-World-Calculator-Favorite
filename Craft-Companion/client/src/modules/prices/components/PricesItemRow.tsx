import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { Badge } from '../../../components/ui';
import { formatNumber } from '../../../utils/formatters';
import type { MarketPriceItem } from '../types';
import { getRecommendationVariant } from '../services/pricesService';

interface PricesItemRowProps {
  item: MarketPriceItem;
}

export const PricesItemRow: React.FC<PricesItemRowProps> = ({ item }) => {
  const rec = (item.recommendation || '').toUpperCase();
  const badgeVariant = getRecommendationVariant(rec);

  return (
    <div className="p-3.5 flex items-center justify-between rounded-2xl bg-[#151518] border-none transition-all duration-150">
      <div className="flex items-center gap-3">
        <ResourceIcon symbol={item.referenceSymbol} size={34} />
        <div>
          <span className="font-extrabold text-white text-sm block">
            {item.referenceSymbol}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Ref. Price
          </span>
        </div>
      </div>

      <div className="text-right">
        <span className="text-amber-400 font-black text-sm block font-mono">
          {formatNumber(item.amount)} COIN
        </span>
        {rec && (
          <Badge variant={badgeVariant} size="sm" className="mt-1">
            {rec}
          </Badge>
        )}
      </div>
    </div>
  );
};
