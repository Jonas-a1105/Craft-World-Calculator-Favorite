import React from 'react';
import {
  Buildings2BoldDuotone,
  BatteryChargeBoldDuotone,
  BoltBoldDuotone,
  SafeSquareBoldDuotone,
  CityBoldDuotone,
  SledgehammerBoldDuotone,
  StarBoldDuotone,
  BoxBoldDuotone,
  Home2BoldDuotone,
  ScaleBoldDuotone,
} from 'solar-icon-set';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MicroscopeIcon,
  PineTreeIcon,
  GraduationCapIcon,
} from '@hugeicons/core-free-icons';
import type { BuildingSummaryItem } from '../types';
import { formatBuildingType } from '../services/empireService';

interface EmpireBaseStructuresProps {
  buildingSummary: Record<string, BuildingSummaryItem>;
  totalStructures: number;
  language: string;
}

const renderStructureIcon = (type: string) => {
  switch (type) {
    case 'BATTERY':
      return <BatteryChargeBoldDuotone className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'COSMETIC':
      return <HugeiconsIcon icon={PineTreeIcon} size={16} className="text-emerald-400 shrink-0" />;
    case 'EDUCATIONAL':
      return <HugeiconsIcon icon={GraduationCapIcon} size={16} className="text-indigo-400 shrink-0" />;
    case 'EXCHANGE':
      return <ScaleBoldDuotone className="w-4 h-4 text-amber-400 shrink-0" />;
    case 'HATCHERY':
      return <BoxBoldDuotone className="w-4 h-4 text-cyan-400 shrink-0" />;
    case 'HOUSE':
      return <Home2BoldDuotone className="w-4 h-4 text-rose-400 shrink-0" />;
    case 'POWER_PLANT':
      return <BoltBoldDuotone className="w-4 h-4 text-amber-400 shrink-0" />;
    case 'PROFICIENCY':
      return <StarBoldDuotone className="w-4 h-4 text-amber-300 shrink-0" />;
    case 'RESEARCH_CENTER':
      return <HugeiconsIcon icon={MicroscopeIcon} size={16} className="text-cyan-400 shrink-0" />;
    case 'TOWN_HALL':
      return <CityBoldDuotone className="w-4 h-4 text-purple-400 shrink-0" />;
    case 'VAULT':
      return <SafeSquareBoldDuotone className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'WORKSHOP':
      return <SledgehammerBoldDuotone className="w-4 h-4 text-amber-400 shrink-0" />;
    default:
      return <Buildings2BoldDuotone className="w-4 h-4 text-slate-400 shrink-0" />;
  }
};

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
            <div className="min-w-0 pr-2 flex items-center gap-2">
              {renderStructureIcon(type)}
              <div className="min-w-0">
                <span className="font-bold text-slate-200 block truncate text-xs">
                  {formatBuildingType(type, language)}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                  {summary.count} {summary.count === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>
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
