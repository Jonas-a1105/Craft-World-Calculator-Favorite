import React from 'react';
import type { AdvisorFilterMode } from '../types';

interface AdvisorFilterBarProps {
  filterMode: AdvisorFilterMode;
  onFilterModeChange: (mode: AdvisorFilterMode) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  totalCount: number;
  language: string;
}

export const AdvisorFilterBar: React.FC<AdvisorFilterBarProps> = ({
  filterMode,
  onFilterModeChange,
  searchTerm,
  onSearchTermChange,
  totalCount,
  language,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
      {/* Quick Filter Pills */}
      <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-full text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onFilterModeChange('all')}
          className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-full font-bold transition-all cursor-pointer border-none flex-shrink-0 ${
            filterMode === 'all'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          {language === 'es' ? 'Todas' : 'All'} ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange('fast_roi')}
          className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-full font-bold transition-all cursor-pointer border-none flex-shrink-0 ${
            filterMode === 'fast_roi'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-amber-300 hover:bg-white/[0.04]'
          }`}
        >
          {language === 'es' ? 'Rápido ROI (≤ 3 días)' : 'Fast ROI (≤ 3 days)'}
        </button>
        <button
          type="button"
          onClick={() => onFilterModeChange('best_profit')}
          className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-full font-bold transition-all cursor-pointer border-none flex-shrink-0 ${
            filterMode === 'best_profit'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-emerald-300 hover:bg-white/[0.04]'
          }`}
        >
          {language === 'es' ? 'Mayor Ganancia' : 'Top Profit'}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder={
            language === 'es' ? 'Buscar fábrica o recurso...' : 'Search factory or token...'
          }
          className="w-full bg-[#18181b] hover:bg-[#202024] focus:bg-[#202024] text-white text-xs pl-9 pr-4 py-2.5 rounded-full border-none outline-none focus:ring-1 focus:ring-sky-500/50 placeholder:text-zinc-500 transition-all shadow-md"
        />
      </div>
    </div>
  );
};
