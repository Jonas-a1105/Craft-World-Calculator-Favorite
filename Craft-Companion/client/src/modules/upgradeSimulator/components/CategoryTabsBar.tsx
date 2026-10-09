import React from 'react';
import type { CategoryTab } from '../types';
import { CATEGORY_TABS } from '../data/upgradeSimulatorCatalog';

interface CategoryTabsBarProps {
  activeCategory: CategoryTab;
  onSelectCategory: (tab: CategoryTab) => void;
  onReset: () => void;
  language: string;
}

export const CategoryTabsBar: React.FC<CategoryTabsBarProps> = ({
  activeCategory,
  onSelectCategory,
  onReset,
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="w-full flex items-center justify-between gap-3 py-2 select-none">
      {/* Carousel Scroll Container with padding to prevent shadow clipping */}
      <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none p-1.5 -m-1.5">
        <div className="flex items-center gap-2 w-max">
          {CATEGORY_TABS.map((tab) => {
            const isActive = tab.id === activeCategory;
            const label = isEs ? tab.labelEs : tab.labelEn;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border-none outline-none cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-purple-600/30 text-purple-200 ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/25 scale-[1.02]'
                    : 'bg-[#1c1c22] text-slate-400 hover:text-white hover:bg-[#25252e]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Button (shrink-0 with shadow preserved) */}
      <div className="p-1.5 -m-1.5 shrink-0">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c1c22] hover:bg-[#25252e] text-slate-300 hover:text-white text-xs font-mono font-semibold transition-all border-none outline-none shadow-md cursor-pointer shrink-0"
          title={isEs ? 'Restablecer todos los niveles a valores por defecto' : 'Reset all upgrades to default'}
        >
          <span>↺</span>
          <span className="hidden sm:inline">{isEs ? 'Restablecer' : 'Reset'}</span>
        </button>
      </div>
    </div>
  );
};
