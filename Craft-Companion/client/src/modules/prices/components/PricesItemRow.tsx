import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { Badge } from '../../../components/ui';
import { formatNumber } from '../../../utils/formatters';
import type { MarketPriceItem } from '../types';
import { getRecommendationVariant } from '../services/pricesService';
import { useAppStore } from '../../../store/useAppStore';

interface PricesItemRowProps {
  item: MarketPriceItem;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? '#fbbf24' : 'none'}
    stroke={filled ? '#fbbf24' : '#64748b'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 transition-transform group-hover:scale-110"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const PricesItemRow: React.FC<PricesItemRowProps> = ({ item }) => {
  const rec = (item.recommendation || '').toUpperCase();
  const badgeVariant = getRecommendationVariant(rec);
  const isFav = useAppStore((state) => state.isFavorite(item.referenceSymbol));
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  return (
    <div
      className={`p-3.5 flex items-center justify-between rounded-2xl bg-[#151518] transition-all duration-150 border ${
        isFav ? 'border-amber-500/40 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.08)]' : 'border-[#26262a]/40'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => toggleFavorite(item.referenceSymbol)}
          className="group p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
          title={isFav ? 'Quitar de favoritos' : 'Marcar favorito'}
        >
          <StarIcon filled={isFav} />
        </button>
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
