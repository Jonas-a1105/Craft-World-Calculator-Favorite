import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import type { ContributionTierId, TierContributionItem } from '../types';
import { CONTRIBUTION_TIERS } from '../data/masterpieceData';

interface TierContributionsGridProps {
  tiers: ContributionTierId[];
  activeTier: ContributionTierId;
  onSelectTier: (tier: ContributionTierId) => void;
  items: TierContributionItem[];
  onUpdateContribution: (symbol: string, amount: number) => void;
  language: string;
}

export const TierContributionsGrid: React.FC<TierContributionsGridProps> = ({
  activeTier,
  onSelectTier,
  items,
  onUpdateContribution,
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="w-full space-y-3 pt-1">
      {/* Tier Selector Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            {isEs ? 'Objetivo de Contribución Personal' : 'Personal Contribution Target'}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isEs
              ? 'Rastrea tus entregas por cada nivel de recompensa:'
              : 'Track your deliveries for each reward tier:'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CONTRIBUTION_TIERS.map((tier) => {
            const isSelected = tier === activeTier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => onSelectTier(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border-none ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-[#22222a] text-slate-300 hover:text-white hover:bg-[#2c2c36]'
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Tier Requirement Cards - high contrast elevated surfaces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const isComplete = item.contributed >= item.required;
          return (
            <div
              key={item.symbol}
              className={`p-4 rounded-3xl bg-[#1c1c22] hover:bg-[#23232b] transition-all border-none shadow-xl shadow-black/25 space-y-3.5 outline-none select-none ${
                isComplete ? 'bg-[#1c221e]' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#131316] flex items-center justify-center shrink-0 shadow-inner">
                    <ResourceIcon symbol={item.symbol} size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 truncate uppercase">
                      {item.symbol}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                    isComplete
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-[#131316] text-slate-200'
                  }`}
                >
                  {item.percent}%
                </span>
              </div>

              {/* Progress fraction and bar */}
              <div className="space-y-1.5 p-2.5 rounded-2xl bg-[#131316]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">
                    {isEs ? 'Aportado:' : 'Contributed:'}
                  </span>
                  <span className="text-white font-bold">
                    {item.contributed.toLocaleString()} / {item.required.toLocaleString()}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[#0a0a0c] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    }`}
                    style={{ width: `${Math.min(100, item.percent)}%` }}
                  />
                </div>
              </div>

              {/* Quick Update Controls */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateContribution(
                        item.symbol,
                        Math.max(0, item.contributed - 10),
                      )
                    }
                    className="w-7 h-7 rounded-xl bg-[#26262e] hover:bg-[#32323e] text-slate-200 hover:text-white text-xs font-mono font-bold flex items-center justify-center transition-colors border-none shadow-sm"
                    title="-10"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateContribution(item.symbol, item.contributed + 10)
                    }
                    className="w-7 h-7 rounded-xl bg-[#26262e] hover:bg-[#32323e] text-slate-200 hover:text-white text-xs font-mono font-bold flex items-center justify-center transition-colors border-none shadow-sm"
                    title="+10"
                  >
                    +
                  </button>
                </div>

                <input
                  type="number"
                  min="0"
                  value={item.contributed}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onUpdateContribution(item.symbol, isNaN(val) ? 0 : val);
                  }}
                  className="w-20 px-2.5 py-1 rounded-xl bg-[#131316] text-right font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 border-none shadow-inner"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
