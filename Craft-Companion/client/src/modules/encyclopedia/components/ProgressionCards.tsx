import React, { useState } from 'react';
import { LevelProgression } from '../types';
import { LevelCard } from './LevelCard';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  levels: LevelProgression[];
}

export const ProgressionCards: React.FC<Props> = ({ levels }) => {
  const { language } = useTranslation();
  const [levelFilter, setLevelFilter] = useState<string>('');

  const displayedLevels = levelFilter.trim()
    ? levels.filter((l) => l.level.toString().includes(levelFilter.trim()))
    : levels;

  return (
    <div className="space-y-4 mb-10 w-full min-w-0 max-w-full">
      {/* Controls Bar: Removed viewMode toggle, kept Filter & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        {/* Left: Quick Level Filter */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={levels.length}
            placeholder={language === 'es' ? 'Filtrar nivel...' : 'Filter level...'}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-[#18181c] text-xs px-3.5 py-1.5 rounded-full border-none text-slate-200 placeholder-slate-500 w-36 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 font-mono shadow-inner"
          />
          {levelFilter.trim() && (
            <button
              onClick={() => setLevelFilter('')}
              className="text-[11px] text-slate-400 hover:text-slate-200 font-mono underline cursor-pointer bg-transparent border-none"
            >
              {language === 'es' ? 'Limpiar' : 'Clear'}
            </button>
          )}
        </div>

        {/* Right: Legend */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 select-none font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0"></span>
          <span className="text-emerald-400">
            {language === 'es'
              ? 'verde - cambio vs nivel anterior'
              : 'green - change vs previous level'}
          </span>
        </div>
      </div>

      {/* Stack of Full Data Cards */}
      <div className="space-y-3 w-full min-w-0">
        {displayedLevels.map((row) => (
          <LevelCard key={row.level} row={row} />
        ))}
      </div>

      {displayedLevels.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-xs bg-[#18181c] rounded-2xl p-6">
          {language === 'es'
            ? 'No se encontraron niveles para este filtro.'
            : 'No levels found for this filter.'}
        </div>
      )}
    </div>
  );
};
