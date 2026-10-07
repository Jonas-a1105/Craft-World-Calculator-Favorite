import React from 'react';
import { CloseCircleLinear } from 'solar-icon-set';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

export const EncyclopediaHeader: React.FC<Props> = ({ search, onSearchChange }) => {
  const { language } = useTranslation();

  // Remove diacritics so TheImpostor font glyphs never fallback to system fonts
  const rawTitle = language === 'es' ? 'Enciclopedia de Fabricas' : 'Factory Encyclopedia';

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-1 mb-4">
      <div className="space-y-1 min-w-0 max-w-full">
        <h1
          className="text-base sm:text-lg md:text-xl font-game text-white tracking-wide leading-tight truncate"
          style={{
            fontFamily: "'TheImpostor', sans-serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(56,189,248,0.2)',
          }}
          title={rawTitle}
        >
          {rawTitle}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 font-main max-w-3xl leading-relaxed">
          {language === 'es'
            ? 'Enciclopedia completa de cada edificio, directo de los datos del juego: costes, rendimiento, producción y detalles de mejora en cada nivel.'
            : 'Full encyclopedia of every building, straight from the game data: costs, yields, production and upgrade details at every level.'}
        </p>
      </div>

      <div className="relative w-full md:w-64 shrink-0">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={language === 'es' ? 'Buscar fábrica...' : 'Search building...'}
          className="w-full bg-[#1c1c20] text-slate-200 placeholder-slate-500 text-xs px-4 py-2.5 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all shadow-inner"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-full border-none shrink-0"
            aria-label="Clear search"
          >
            <CloseCircleLinear className="w-4 h-4 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
};
