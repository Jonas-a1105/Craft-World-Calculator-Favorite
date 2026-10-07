import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import type { ValuedInventoryItem } from '../types';

interface InventoryResourceCardProps {
  item: ValuedInventoryItem;
  isExpanded: boolean;
  language: string;
  onToggleExpand: () => void;
  onNavigateToResource: (symbol: string) => void;
}

export const InventoryResourceCard: React.FC<InventoryResourceCardProps> = ({
  item,
  isExpanded,
  language,
  onToggleExpand,
  onNavigateToResource,
}) => {
  const rec = (item.recommendation || '').toUpperCase();

  return (
    <div
      onClick={onToggleExpand}
      className={`group bg-[#202024] hover:bg-[#28282e] p-2.5 pr-4 rounded-[28px] transition-[background-color,transform,box-shadow] duration-200 cursor-pointer select-none shadow-md overflow-hidden ${
        isExpanded ? 'bg-[#24242a]' : 'hover:scale-[1.015]'
      }`}
    >
      {/* Top Row: Avatar, Info, Total, and Arrow */}
      <div className="flex items-center justify-between">
        {/* Left: Circular Avatar & Name + Amount */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-full bg-[#151518] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <ResourceIcon symbol={item.symbol} size={26} />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
              {item.symbol}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 truncate">
              {formatNumber(item.amount)} {language === 'es' ? 'uds' : 'units'}
            </p>
          </div>
        </div>

        {/* Right: Total Value in COIN & Expand Arrow */}
        <div className="flex items-center gap-2.5 shrink-0 ml-2">
          <div className="text-right">
            <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono block">
              {formatNumber(item.totalValue)}
            </span>
            <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider block">
              COIN
            </span>
          </div>

          <div
            className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-transform duration-200 ${
              isExpanded ? 'rotate-90 text-amber-400 bg-amber-400/10' : ''
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Smooth Slide-down Details (Price & Badges) */}
      <div
        className={`grid transition-[grid-template-rows,opacity,margin,padding] duration-200 ease-out ${
          isExpanded
            ? 'grid-rows-[1fr] opacity-100 mt-2.5 pt-2.5 border-t border-white/5'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex items-center justify-between px-2.5 py-1.5 text-xs bg-[#151518]/70 rounded-2xl">
            {/* Clean Formatted Price */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Price:</span>
              <span className="text-slate-200 font-bold font-mono">
                {formatNumber(item.unitPrice, item.unitPrice < 0.01 ? 4 : 2)} COIN
              </span>
            </div>

            {/* Badges and Activity Link in the slide-down drawer */}
            <div className="flex items-center gap-2">
              {/* Market Variation Badge */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToResource(item.symbol);
                }}
                role="button"
                title={language === 'es' ? 'Ver detalles de mercado' : 'View market details'}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border-none cursor-pointer hover:scale-105 active:scale-95 transition-transform select-none ${
                  item.delta?.isUp
                    ? 'bg-[rgba(34,197,94,0.18)] text-[rgb(34,197,94)]'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                <span>{item.delta?.isUp ? '▲' : '▼'}</span>
                <span>{item.delta?.percentStr}%</span>
              </div>

              {/* Recommendation Badge */}
              {rec && (
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border-none select-none ${
                    rec === 'BUY'
                      ? 'bg-[rgba(34,197,94,0.2)] text-[rgb(34,197,94)]'
                      : rec === 'SELL'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {rec}
                </span>
              )}

              {/* Button to navigate to detailed resource page */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToResource(item.symbol);
                }}
                style={{ padding: 0 }}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[rgb(34,197,94)] flex items-center justify-center font-bold text-sm transition-all border-none shrink-0 select-none !p-0 ml-0.5"
                title={language === 'es' ? 'Ver detalles' : 'View details'}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
