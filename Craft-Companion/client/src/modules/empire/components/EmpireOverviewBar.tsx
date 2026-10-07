import React from 'react';
import type { EmpireOverviewStats } from '../types';

interface EmpireOverviewBarProps {
  stats: EmpireOverviewStats;
  language: string;
}

export const EmpireOverviewBar: React.FC<EmpireOverviewBarProps> = ({ stats, language }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-[#18181b] rounded-[24px] p-4 text-center shadow-lg border-none">
        <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block font-main">
          {language === 'es' ? 'Parcelas' : 'Land Plots'}
        </span>
        <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
          {stats.totalPlots}
        </span>
      </div>

      <div className="bg-[#18181b] rounded-[24px] p-4 text-center shadow-lg border-none">
        <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block font-main">
          {language === 'es' ? 'Fábricas Instaladas' : 'Active Factories'}
        </span>
        <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
          {stats.totalFactories}
        </span>
      </div>

      <div className="bg-[#18181b] rounded-[24px] p-4 text-center shadow-lg border-none">
        <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block font-main">
          {language === 'es' ? 'Trabajadores' : 'Workers'}
        </span>
        <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
          {stats.totalWorkers}
        </span>
      </div>

      <div className="bg-[#18181b] rounded-[24px] p-4 text-center shadow-lg border-none">
        <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider block font-main">
          {language === 'es' ? 'Huevos / Dynos' : 'Eggs / Dynos'}
        </span>
        <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
          {stats.dynosOrEggsText}
        </span>
      </div>
    </div>
  );
};
