import React from 'react';

interface PowerSimulatorHeaderProps {
  language: string;
}

export const PowerSimulatorHeader: React.FC<PowerSimulatorHeaderProps> = ({
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="w-full text-center space-y-3 select-none pt-2">
      {/* Title with authentic game typography */}
      <h1
        className="text-lg sm:text-xl md:text-2xl font-game font-impostor text-white tracking-wide leading-tight text-center"
        style={{
          fontFamily: "'TheImpostor', sans-serif",
          textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(56,189,248,0.25)',
        }}
      >
        Power Simulator
      </h1>

      {/* Subtitle / Purpose */}
      <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-mono leading-relaxed text-center px-4">
        {isEs
          ? 'Evalúa tu costo diario de producción de energía por cada 100k de Power — combinando plantas pasivas y power packs — compara opciones y encuentra la fuente más económica.'
          : 'Evaluate your daily power production cost per 100k Power — from passive plants and power packs — compare them and find the cheapest source.'}
      </p>

      {/* 3-Step Guide */}
      <div className="max-w-2xl mx-auto text-left bg-[#17171c] p-3 sm:p-4 rounded-2xl shadow-inner space-y-1.5 font-mono text-[11px] sm:text-xs">
        <div className="flex items-start gap-2 text-slate-300">
          <span className="font-bold text-emerald-400 shrink-0">1.</span>
          <span>
            {isEs
              ? 'Configura tus plantas pasivas '
              : 'Set up your passive plants '}
            <span className="text-emerald-400 font-semibold">(Airstream & Sunforge)</span>
            {isEs
              ? '; actúan como reducción gratuita en el costo total efectivo.'
              : '; they are used as a free offset in the total effective cost.'}
          </span>
        </div>
        <div className="flex items-start gap-2 text-slate-300">
          <span className="font-bold text-indigo-400 shrink-0">2.</span>
          <span>
            {isEs
              ? 'Configura tu uso diario previsto de '
              : 'Configure your expected daily '}
            <span className="text-indigo-400 font-semibold">
              {isEs ? 'Power Packs' : 'Power Packs'}
            </span>
            {isEs ? '.' : ' usage.'}
          </span>
        </div>
        <div className="flex items-start gap-2 text-slate-300">
          <span className="font-bold text-rose-400 shrink-0">3.</span>
          <span>
            {isEs
              ? 'Revisa tu '
              : 'Check your '}
            <span className="text-rose-400 font-semibold">
              {isEs ? 'Costo efectivo total / 100k Power' : 'Total effective cost / 100k Power'}
            </span>
            {isEs
              ? ' para conocer tu costo promedio diario de energía.'
              : ' to get your average daily power cost.'}
          </span>
        </div>
      </div>
    </div>
  );
};
