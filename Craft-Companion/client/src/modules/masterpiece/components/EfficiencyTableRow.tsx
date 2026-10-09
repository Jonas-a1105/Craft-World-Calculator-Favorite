import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import type { EfficiencyItem } from '../types';

interface EfficiencyTableRowProps {
  item: EfficiencyItem;
  onMultiplierChange: (symbol: string, mult: number) => void;
  baseSymbol: string;
}

function formatValue(val: number, isCurrency = false): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(2)}K`;
  }
  return isCurrency ? val.toFixed(2) : val.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export const EfficiencyTableRow: React.FC<EfficiencyTableRowProps> = ({
  item,
  onMultiplierChange,
  baseSymbol,
}) => {
  const isTopTier = item.rank <= 3;
  const isGoodTier = item.rank <= 10;

  const cycleMultiplier = () => {
    const next = item.multiplier === 1 ? 2 : item.multiplier === 2 ? 4 : item.multiplier === 4 ? 8 : 1;
    onMultiplierChange(item.symbol, next);
  };

  return (
    <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] text-xs font-mono">
      {/* Rank */}
      <td className="py-3 px-3.5 text-center whitespace-nowrap">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
            item.rank === 1
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : item.rank === 2
                ? 'bg-slate-300 text-slate-950'
                : item.rank === 3
                  ? 'bg-amber-700 text-amber-100'
                  : 'bg-white/5 text-slate-400'
          }`}
        >
          {item.rank}
        </span>
      </td>

      {/* Resource Name & Icon */}
      <td className="py-3 px-3 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <ResourceIcon symbol={item.symbol} size={24} />
          <div>
            <span className="font-semibold text-white block text-sm font-sans">
              {item.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {item.symbol}
            </span>
          </div>
        </div>
      </td>

      {/* Base Crowns */}
      <td className="py-3 px-3 text-right text-slate-300 font-medium whitespace-nowrap">
        {formatValue(item.crowns)}
      </td>

      {/* Power + Multiplier Bracket Toggle */}
      <td className="py-3 px-3 text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1.5 justify-end">
          <span className="text-slate-300">{formatValue(item.power)}</span>
          <button
            type="button"
            onClick={cycleMultiplier}
            title="Click to cycle multiplier (1x, 2x, 4x, 8x)"
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
              item.multiplier > 1
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {item.multiplier}x
          </button>
        </div>
      </td>

      {/* Market Price */}
      <td className="py-3 px-3 text-right text-slate-300 whitespace-nowrap">
        {formatValue(item.marketPrice, true)}{' '}
        <span className="text-[10px] text-slate-400">{baseSymbol}</span>
      </td>

      {/* Total Crowns */}
      <td className="py-3 px-3 text-right text-slate-300 font-medium whitespace-nowrap">
        {formatValue(item.totalCrowns)}
      </td>

      {/* Total Cost */}
      <td className="py-3 px-3 text-right text-slate-300 whitespace-nowrap">
        {formatValue(item.totalCost, true)}{' '}
        <span className="text-[10px] text-slate-400">{baseSymbol}</span>
      </td>

      {/* Crowns / COIN (Efficiency) */}
      <td className="py-3 px-3.5 text-right whitespace-nowrap">
        <div className="inline-flex items-center justify-end">
          <span
            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
              isTopTier
                ? 'bg-emerald-500/15 text-emerald-300'
                : isGoodTier
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'bg-white/5 text-slate-300'
            }`}
          >
            {formatValue(item.efficiency)}
          </span>
        </div>
      </td>
    </tr>
  );
};
