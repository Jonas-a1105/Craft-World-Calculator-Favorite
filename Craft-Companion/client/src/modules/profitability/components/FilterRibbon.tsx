import React from 'react';
import type { FilterMode, SortByOption } from '../types';
import { useTranslation } from '../../../utils/i18n';
import { Combobox } from '../../../components/ui/Combobox';

export interface FilterRibbonProps {
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  sortBy: SortByOption;
  setSortBy: (sort: SortByOption) => void;
  search: string;
  setSearch: (search: string) => void;
  uniqueTokensCount: number;
  ownedCount: number;
}

export const FilterRibbon: React.FC<FilterRibbonProps> = ({
  filterMode,
  setFilterMode,
  sortBy,
  setSortBy,
  search,
  setSearch,
  uniqueTokensCount,
  ownedCount,
}) => {
  const { language } = useTranslation();

  const filterTabs = [
    {
      id: 'all',
      label:
        language === 'es'
          ? `Todas (${uniqueTokensCount})`
          : `All (${uniqueTokensCount})`,
    },
    {
      id: 'owned',
      label:
        language === 'es'
          ? `Mis Fábricas (${ownedCount})`
          : `My Owned (${ownedCount})`,
    },
    { id: 'profitable', label: language === 'es' ? 'En Ganancia' : 'Profitable' },
    { id: 'loss', label: language === 'es' ? 'En Pérdida' : 'In Loss', hasWarning: true },
  ];

  return (
    <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 shadow-xl border-none">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Filter Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterMode(t.id as FilterMode)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                filterMode === t.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-[#202024] text-zinc-400 hover:bg-[#28282e] hover:text-white border-none'
              }`}
            >
              {t.hasWarning && (
                <svg
                  className="w-3.5 h-3.5 text-rose-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Sort Selector & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2.5">
          <Combobox
            value={sortBy}
            onChange={(val) => setSortBy(val as SortByOption)}
            options={[
              {
                value: 'profit_hour',
                label: language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour',
              },
              {
                value: 'profit_day',
                label: language === 'es' ? 'Ganancia / Día' : 'Profit / Day',
              },
              {
                value: 'xp_hour',
                label: language === 'es' ? 'XP / Hora' : 'XP / Hour',
              },
              {
                value: 'margin',
                label: language === 'es' ? 'Margen %' : 'Margin %',
              },
              {
                value: 'alphabetical',
                label: language === 'es' ? 'Alfabético' : 'A-Z',
              },
            ]}
          />

          <input
            type="text"
            placeholder={
              language === 'es' ? 'Buscar fábrica...' : 'Search factory...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:w-48 !rounded-full !bg-[#202024] hover:!bg-[#28282e] px-4 py-2 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
