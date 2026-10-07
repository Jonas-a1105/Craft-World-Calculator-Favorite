import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';

interface ResourcePriceBannerProps {
  displayPrice: number;
  displayDiff: number;
  displayPct: number;
  displayIsUp: boolean;
  timeLabel: string;
}

export const ResourcePriceBanner: React.FC<ResourcePriceBannerProps> = ({
  displayPrice,
  displayDiff,
  displayPct,
  displayIsUp,
  timeLabel,
}) => {
  return (
    <div className="flex flex-col items-start sm:items-center text-left sm:text-center py-2 space-y-2">
      <div className="flex items-center gap-3">
        <ResourceIcon symbol="Coin" size={32} />
        <div className="text-3xl sm:text-4xl md:text-5xl font-normal text-amber-400 font-title tracking-tight select-none">
          {formatNumber(displayPrice, displayPrice < 0.01 ? 5 : 4)}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-semibold">
        <span
          className={`px-3 py-0.5 rounded-full text-xs font-bold font-mono border-none ${
            displayIsUp
              ? 'bg-[rgba(34,197,94,0.18)] text-[rgb(34,197,94)]'
              : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          {displayIsUp ? '▲' : '▼'}{' '}
          {formatNumber(Math.abs(displayDiff), displayPrice < 0.01 ? 5 : 4)} (
          {Math.abs(displayPct).toFixed(2)}%)
        </span>
        <span className="text-slate-400 font-normal">{timeLabel}</span>
      </div>
    </div>
  );
};
