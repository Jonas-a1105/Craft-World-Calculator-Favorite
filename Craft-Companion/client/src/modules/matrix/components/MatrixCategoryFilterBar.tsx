import React from 'react';
import { CATEGORIES } from '../services/matrixService';

export interface MatrixCategoryFilterBarProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  visibleResourcesCount: number;
  totalResourcesCount: number;
  onResetPrices: () => void;
  language: 'es' | 'en';
}

export const MatrixCategoryFilterBar: React.FC<MatrixCategoryFilterBarProps> = ({
  selectedCategory,
  setSelectedCategory,
  visibleResourcesCount,
  totalResourcesCount,
  onResetPrices,
  language,
}) => {
  return (
    <div className="bg-[#18181b] p-2.5 sm:p-3 rounded-[24px] border-none shadow-md space-y-2.5">
      {/* Row 1: Horizontal Scroll Carousel of Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto modal-custom-scroll pb-1 -mx-0.5 px-0.5 scroll-smooth">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none shadow-sm ${
            selectedCategory === null
              ? 'bg-white text-black'
              : 'bg-[#141416] hover:bg-[#202024] text-zinc-400 hover:text-white'
          }`}
        >
          {language === 'es' ? 'Todas' : 'All'}
        </button>
        {Object.entries(CATEGORIES).map(([catKey, cat]) => {
          const isSelected = selectedCategory === catKey;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? null : catKey)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none shadow-sm ${
                isSelected
                  ? 'bg-white/20 text-white ring-1 ring-white/30'
                  : `${cat.bg} ${cat.color}`
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Row 2: Secondary Bar with Action Buttons and Count */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.04] text-xs">
        <button
          type="button"
          onClick={onResetPrices}
          className="text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1 rounded-full bg-[#141416] hover:bg-[#202024] transition-colors cursor-pointer border-none flex items-center gap-1.5 shadow-inner"
        >
          <span>↺</span>
          <span>
            {language === 'es' ? 'Restablecer precios' : 'Reset prices'}
          </span>
        </button>
        <div className="text-xs text-zinc-400 font-mono font-bold bg-[#141416] px-3 py-1 rounded-full shadow-inner">
          {language === 'es' ? 'Recursos' : 'Resources'}{' '}
          {visibleResourcesCount}/{totalResourcesCount}
        </div>
      </div>
    </div>
  );
};
