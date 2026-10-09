import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';

interface DisabledPowerPlantsSectionProps {
  language: string;
}

export const DisabledPowerPlantsSection: React.FC<DisabledPowerPlantsSectionProps> = ({
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="space-y-3 select-none">
      {/* Section Header */}
      <div>
        <h2 className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase">
          {isEs ? 'PLANTAS DE ENERGÍA' : 'POWER PLANTS'}
        </h2>
        <p className="text-xs font-mono text-slate-500 mt-0.5">
          {isEs
            ? 'Steamforge y Reactor están actualmente desactivadas en el juego oficial, por lo que quedan excluidas de todos los cálculos.'
            : 'Steamforge and Reactor are disabled in-game, so they are left out of every total on this page.'}
        </p>
      </div>

      {/* Grid of 2 Disabled Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STEAMFORGE */}
        <div className="relative p-4 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/25 overflow-hidden border-none outline-none">
          <div className="flex flex-col gap-3 opacity-30 grayscale pointer-events-none">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#131316] flex items-center justify-center p-1.5 shadow-inner shrink-0">
                <ResourceIcon symbol="Lava" size={26} />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-sm font-bold text-white tracking-wide">
                  STEAMFORGE
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {isEs ? 'Insumo de LAVA, ciclo de 5 min' : 'LAVA input, 5 min cycle'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-slate-400 w-12 shrink-0">
                {isEs ? 'Nivel' : 'Level'}
              </span>
              <div className="flex-1 bg-[#131316] text-slate-500 text-xs font-mono px-3 py-2 rounded-xl shadow-inner">
                — {isEs ? 'No adquirida' : 'Not owned'} —
              </div>
            </div>
          </div>

          {/* DISABLED Stamp Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="-rotate-12 rounded-xl border border-rose-500/40 bg-black/85 px-5 py-2 shadow-2xl backdrop-blur-sm">
              <span className="font-mono text-xs sm:text-sm font-black tracking-[0.25em] text-rose-400">
                DISABLED
              </span>
            </div>
          </div>
        </div>

        {/* REACTOR */}
        <div className="relative p-4 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/25 overflow-hidden border-none outline-none">
          <div className="flex flex-col gap-3 opacity-30 grayscale pointer-events-none">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#131316] flex items-center justify-center p-1.5 shadow-inner shrink-0">
                <ResourceIcon symbol="Hydrogen" size={26} />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-sm font-bold text-white tracking-wide">
                  REACTOR
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {isEs ? 'Insumo de HIDRÓGENO, ciclo de 1 h' : 'HYDROGEN input, 1 h cycle'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-slate-400 w-12 shrink-0">
                {isEs ? 'Nivel' : 'Level'}
              </span>
              <div className="flex-1 bg-[#131316] text-slate-500 text-xs font-mono px-3 py-2 rounded-xl shadow-inner">
                — {isEs ? 'No adquirida' : 'Not owned'} —
              </div>
            </div>
          </div>

          {/* DISABLED Stamp Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="-rotate-12 rounded-xl border border-rose-500/40 bg-black/85 px-5 py-2 shadow-2xl backdrop-blur-sm">
              <span className="font-mono text-xs sm:text-sm font-black tracking-[0.25em] text-rose-400">
                DISABLED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
