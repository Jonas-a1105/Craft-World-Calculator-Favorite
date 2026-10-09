import React from 'react';

interface UpgradeSimulatorHeaderProps {
  language: string;
  totalFacilities: number;
}

export const UpgradeSimulatorHeader: React.FC<UpgradeSimulatorHeaderProps> = ({
  language,
  totalFacilities,
}) => {
  const isEs = language === 'es';

  return (
    <div className="w-full text-center space-y-2 select-none pt-2">
      {/* Title with game typography, responsive, not overly large */}
      <h1
        className="text-lg sm:text-xl md:text-2xl font-game font-impostor text-white tracking-wide leading-tight text-center"
        style={{
          fontFamily: "'TheImpostor', sans-serif",
          textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(245,158,11,0.25)',
        }}
      >
        {isEs ? 'Upgrade Simulator' : 'Upgrade Simulator'}
      </h1>

      {/* Subtitle / Description */}
      <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-mono leading-relaxed text-center px-4">
        {isEs
          ? 'Recursos y costo de mercado para mejorar cualquier fábrica o la Mina de Tierra entre dos niveles. Por defecto muestra la ruta completa (L1 ➔ máx).'
          : 'Resources and market cost to upgrade any factory or the Earth Mine between two levels. Defaults show the full upgrade path (L1 ➔ max).'}
      </p>

      {/* Facilities Count Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1c1c22] text-slate-300 text-xs font-mono font-medium shadow-inner">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          {totalFacilities} {isEs ? 'fábricas y minas verificadas' : 'verified factories & mines'}
        </span>
      </div>
    </div>
  );
};
