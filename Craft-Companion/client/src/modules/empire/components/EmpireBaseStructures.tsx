import React from 'react';
import { Buildings2BoldDuotone } from 'solar-icon-set';
import type { BuildingSummaryItem } from '../types';
import { formatBuildingType } from '../services/empireService';

interface EmpireBaseStructuresProps {
  buildingSummary: Record<string, BuildingSummaryItem>;
  totalStructures: number;
  language: string;
}

export const EmpireBaseStructures: React.FC<EmpireBaseStructuresProps> = ({
  buildingSummary,
  totalStructures,
  language,
}) => {
  const typesCount = Object.keys(buildingSummary).length;
  if (typesCount === 0) return null;

  return (
    <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-title text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
          <Buildings2BoldDuotone size={18} className="text-purple-400" />
          <span>
            {language === 'es' ? 'Estructuras de la Base' : 'Base Structures'} (
            {totalStructures})
          </span>
        </h2>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
          {typesCount} {language === 'es' ? 'tipos' : 'types'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {Object.entries(buildingSummary).map(([type, summary]) => (
          <div
            key={type}
            className="bg-[#202024] hover:bg-[#25252a] p-3 rounded-[20px] shadow-sm flex items-center justify-between text-xs transition-colors"
          >
            <div className="min-w-0 pr-2">
              <span className="font-bold text-slate-200 block truncate text-xs">
                {formatBuildingType(type, language)}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                {summary.count} {summary.count === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>
            <span className="text-amber-400 font-mono font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
              Nv. {summary.maxLevel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
