import React, { useState } from 'react';
import { LevelProgression, TableViewMode } from '../types';
import { LevelCard } from './LevelCard';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  levels: LevelProgression[];
  viewMode: TableViewMode;
  onViewModeChange: (mode: TableViewMode) => void;
}

export const ProgressionCards: React.FC<Props> = ({
  levels,
  viewMode,
  onViewModeChange,
}) => {
  const { language } = useTranslation();
  const [levelFilter, setLevelFilter] = useState<string>('');

  const displayedLevels = levelFilter.trim()
    ? levels.filter((l) => l.level.toString().includes(levelFilter.trim()))
    : levels;

  return (
    <div className="space-y-4 mb-10 w-full min-w-0 max-w-full">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        {/* Left: View Mode Toggle & Level Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center bg-[#18181c] p-1 rounded-full border-none shadow-md shrink-0">
            <button
              onClick={() => onViewModeChange('essential')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border-none transition-all duration-150 select-none ${
                viewMode === 'essential'
                  ? 'bg-indigo-600/40 text-indigo-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'es' ? 'Esencial' : 'Essential'}
            </button>
            <button
              onClick={() => onViewModeChange('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border-none transition-all duration-150 select-none ${
                viewMode === 'all'
                  ? 'bg-indigo-600/40 text-indigo-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'es' ? 'Todas las columnas' : 'All columns'}
            </button>
          </div>

          {/* Quick Level Filter */}
          <input
            type="number"
            min="1"
            max={levels.length}
            placeholder={language === 'es' ? 'Filtrar nivel...' : 'Filter level...'}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-[#18181c] text-xs px-3.5 py-1.5 rounded-full border-none text-slate-200 placeholder-slate-500 w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 font-mono shadow-inner"
          />
        </div>

        {/* Right: Legend */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 select-none font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0"></span>
          <span className="text-emerald-400">
            {language === 'es'
              ? 'verde - cambio vs anterior'
              : 'green - change vs previous'}
          </span>
        </div>
      </div>

      {/* Stack of Elongated Cards floating on background */}
      <div className="space-y-2.5 w-full min-w-0">
        {displayedLevels.map((row) => (
          <LevelCard key={row.level} row={row} viewMode={viewMode} />
        ))}
      </div>

      {displayedLevels.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-xs">
          {language === 'es' ? 'No se encontraron niveles.' : 'No levels found.'}
        </div>
      )}
    </div>
  );
};
