import React from 'react';
import { CloseCircleLinear } from 'solar-icon-set';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

export const EncyclopediaHeader: React.FC<Props> = ({ search, onSearchChange }) => {
  const { language } = useTranslation();

  // Clean title without extra text, centered with description
  const rawTitle = language === 'es' ? 'Enciclopedia' : 'Encyclopedia';

  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 mt-1 mb-6 w-full">
      <div className="space-y-1.5 max-w-2xl mx-auto text-center">
        <h1
          className="text-lg sm:text-xl md:text-2xl font-game text-white tracking-wide leading-tight"
          style={{
            fontFamily: "'TheImpostor', sans-serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(56,189,248,0.2)',
          }}
          title={rawTitle}
        >
          {rawTitle}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 font-main max-w-2xl mx-auto leading-relaxed text-center">
          {language === 'es'
            ? 'Enciclopedia completa de cada edificio, directo de los datos del juego: costes, rendimiento, producción y detalles de mejora en cada nivel.'
            : 'Full encyclopedia of every building, straight from the game data: costs, yields, production and upgrade details at every level.'}
        </p>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={language === 'es' ? 'Buscar fábrica o recurso...' : 'Search building or resource...'}
          className="w-full bg-[#1c1c20] text-slate-200 placeholder-slate-500 text-xs px-4 py-2.5 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all shadow-inner text-center"
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
