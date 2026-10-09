import React from 'react';
import { CrownBoldDuotone } from 'solar-icon-set';

interface MasterpieceHeaderProps {
  language: string;
  totalResources?: number;
  topEfficiencyCrowns?: number;
}

export const MasterpieceHeader: React.FC<MasterpieceHeaderProps> = ({
  language,
}) => {
  const isEs = language === 'es';
  const title = isEs ? 'Masterpiece & Eficiencia' : 'Masterpiece & Efficiency';

  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 pt-2 pb-4 w-full">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-mono">
        <CrownBoldDuotone size={16} />
        <span>{isEs ? 'Temporada en Curso • En Vivo' : 'Active Season • Live'}</span>
      </div>

      <h1
        className="text-lg sm:text-xl md:text-2xl text-white tracking-wide uppercase leading-tight mt-1"
        style={{
          fontFamily: "'TheImpostor', 'Press Start 2P', sans-serif",
          textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 16px rgba(245,158,11,0.2)',
        }}
      >
        {title}
      </h1>

      <p className="text-xs sm:text-sm text-slate-400 font-main max-w-xl mx-auto leading-relaxed text-center">
        {isEs
          ? 'Monitorea el progreso por liga, gestiona tus cuotas de entrega por tier y maximiza tus coronas por COIN en tiempo real.'
          : 'Track league progress, manage tier contribution goals, and maximize crowns per COIN in real-time.'}
      </p>
    </div>
  );
};
