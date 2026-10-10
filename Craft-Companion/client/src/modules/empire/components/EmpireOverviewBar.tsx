import React from 'react';
import type { EmpireOverviewStats } from '../types';
import {
  MapPointBoldDuotone,
  Buildings2BoldDuotone,
  UserBoldDuotone,
} from 'solar-icon-set';

interface EmpireOverviewBarProps {
  stats: EmpireOverviewStats;
  language: string;
}

export const EmpireOverviewBar: React.FC<EmpireOverviewBarProps> = ({
  stats,
  language,
}) => {
  const isEs = language === 'es';
  const cleanDynosOrEggs = (stats.dynosOrEggsText || '').replace('🥚', '').trim();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
      {/* Stat 1: Parcelas */}
      <div className="bg-[#18181b] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg border-none">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <MapPointBoldDuotone className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block truncate">
            {isEs ? 'Parcelas' : 'Land Plots'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">
            {stats.totalPlots}
          </span>
        </div>
      </div>

      {/* Stat 2: Fábricas Activas */}
      <div className="bg-[#18181b] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg border-none">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
          <Buildings2BoldDuotone className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block truncate">
            {isEs ? 'Fábricas' : 'Factories'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono block">
            {stats.totalFactories}
          </span>
        </div>
      </div>

      {/* Stat 3: Trabajadores */}
      <div className="bg-[#18181b] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg border-none">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
          <UserBoldDuotone className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block truncate">
            {isEs ? 'Trabajadores' : 'Workers'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono block">
            {stats.totalWorkers}
          </span>
        </div>
      </div>

      {/* Stat 4: Huevos / Dynos */}
      <div className="bg-[#18181b] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg border-none">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
          <img
            src="/assets/resources/Dynonest.png"
            alt="Dyno"
            className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block truncate">
            {isEs ? 'Huevos / Dynos' : 'Eggs / Dynos'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">
            {cleanDynosOrEggs}
          </span>
        </div>
      </div>
    </div>
  );
};
