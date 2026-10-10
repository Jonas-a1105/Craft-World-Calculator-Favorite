import React from 'react';
import { StarBold } from 'solar-icon-set';
import { useTranslation } from '../../../utils/i18n';
import type { TableCategory } from '../types';

interface CategoryTabsBarProps {
  activeCategory: TableCategory;
  onSelectCategory: (cat: TableCategory) => void;
  search: string;
  onSearchChange: (q: string) => void;
  favoritesCount: number;
  activeCount: number;
  totalCount: number;
  onMaxAllLevels: () => void;
}

export const CategoryTabsBar: React.FC<CategoryTabsBarProps> = ({
  activeCategory,
  onSelectCategory,
  search,
  onSearchChange,
  favoritesCount,
  activeCount,
  totalCount,
  onMaxAllLevels,
}) => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const tabs: Array<{ id: TableCategory; label: string; badge?: number; isFav?: boolean }> = [
    { id: 'all', label: isEs ? 'Todas' : 'All', badge: totalCount },
    { id: 'earth', label: isEs ? 'Tierra' : 'Earth' },
    { id: 'water', label: isEs ? 'Agua' : 'Water' },
    { id: 'fire', label: isEs ? 'Fuego' : 'Fire' },
    { id: 'special', label: isEs ? 'Especial' : 'Special' },
    { id: 'favorites', label: isEs ? 'Favoritos' : 'Favorites', badge: favoritesCount, isFav: true },
    { id: 'active', label: isEs ? 'Activas' : 'Active', badge: activeCount },
  ];

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none">
      {/* Category Pills (Borderless, clean background) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300'
              }`}
            >
              {tab.isFav && (
                <StarBold
                  className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400'}`}
                />
              )}
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-black/20 text-black' : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right controls: Search input & Max All quick action */}
      <div className="flex items-center gap-2">
        {/* Quick Max All Button */}
        <button
          type="button"
          onClick={onMaxAllLevels}
          className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700/80 text-xs font-bold text-amber-400 transition-colors flex items-center gap-1 whitespace-nowrap"
          title={isEs ? 'Maximizar el nivel de todas las fábricas' : 'Maximize level of all factories'}
        >
          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-[10px] flex items-center justify-center font-black">
            M
          </span>
          <span>{isEs ? 'Max Todos' : 'Max All'}</span>
        </button>

        {/* Search input (Borderless, rounded pill) */}
        <div className="relative flex-1 sm:w-56">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isEs ? 'Buscar recurso...' : 'Search resource...'}
            className="w-full bg-zinc-800/80 text-xs text-white placeholder-zinc-500 rounded-full pl-8 pr-7 py-1.5 outline-none focus:ring-1 focus:ring-amber-500/50"
          />
          <svg
            className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-zinc-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
