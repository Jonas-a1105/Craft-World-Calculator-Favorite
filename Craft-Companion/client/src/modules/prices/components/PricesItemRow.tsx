import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResourceIcon } from '../../../components/GameIcon';
import { Badge } from '../../../components/ui';
import { formatNumber, formatCompact } from '../../../utils/formatters';
import type { MarketPriceItem } from '../types';
import { getRecommendationVariant } from '../services/pricesService';
import { useAppStore } from '../../../store/useAppStore';
import { getCachedResourcePool } from '../../../services/roninPoolsService';

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
  const navigate = useNavigate();
  const rec = (item.recommendation || '').toUpperCase();
  const badgeVariant = getRecommendationVariant(rec);
  const isFav = useAppStore((state) => state.isFavorite(item.referenceSymbol));
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const pool = getCachedResourcePool(item.referenceSymbol);

  const handleRowClick = () => {
    navigate(`/resources/${item.referenceSymbol}`);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`p-3.5 flex items-center justify-between rounded-2xl bg-[#151518] hover:bg-[#1a1b20] transition-all duration-150 cursor-pointer border-none select-none ${
        isFav ? 'shadow-[0_0_15px_rgba(245,158,11,0.08)] bg-amber-500/5' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.referenceSymbol);
          }}
          className="group p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none shrink-0"
          title={isFav ? 'Quitar de favoritos' : 'Marcar favorito'}
        >
          <StarIcon filled={isFav} />
        </button>
        <ResourceIcon symbol={item.referenceSymbol} size={34} />
        <div className="min-w-0">
          <span className="font-extrabold text-white text-sm block truncate">
            {item.referenceSymbol}
          </span>
          {pool && pool.price1d.ath > 0 ? (
            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <span>24h:</span>
              <span className="text-zinc-300 font-semibold">{formatNumber(pool.price1d.median)}</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Ref. Price
            </span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="text-amber-400 font-black text-sm block font-mono">
          {formatNumber(item.amount)} COIN
        </span>
        <div className="flex items-center justify-end gap-1.5 mt-0.5">
          {pool && pool.liquidity.average > 0 && (
            <span className="text-[9px] font-mono text-purple-300 bg-[#1e1f25] px-1.5 py-0.5 rounded-md">
              {formatCompact(pool.liquidity.average)} u
            </span>
          )}
          {rec && (
            <Badge variant={badgeVariant} size="sm">
              {rec}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
