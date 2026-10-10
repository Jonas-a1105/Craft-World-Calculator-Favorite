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
      return <HugeiconsIcon icon={PineTreeIcon} size={15} className="text-emerald-400 shrink-0" />;
    case 'EDUCATIONAL':
      return <HugeiconsIcon icon={GraduationCapIcon} size={15} className="text-indigo-400 shrink-0" />;
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
      return <HugeiconsIcon icon={MicroscopeIcon} size={15} className="text-cyan-400 shrink-0" />;
    case 'TOWN_HALL':
      return <CityBoldDuotone className="w-4 h-4 text-purple-400 shrink-0" />;
    case 'VAULT':
      return <SafeSquareBoldDuotone className="w-4 h-4 text-emerald-400 shrink-0" />;
    case 'WORKSHOP':
      return <SledgehammerBoldDuotone className="w-4 h-4 text-amber-400 shrink-0" />;
    default:
      return <Buildings2BoldDuotone className="w-4 h-4 text-zinc-400 shrink-0" />;
  }
};

export const EmpireBaseStructures: React.FC<EmpireBaseStructuresProps> = ({
  buildingSummary,
  totalStructures,
  language,
}) => {
  const isEs = language === 'es';
  const typesCount = Object.keys(buildingSummary).length;
  if (typesCount === 0) return null;

  return (
    <div className="space-y-3.5 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Buildings2BoldDuotone className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-white tracking-wide uppercase">
              {isEs ? 'Estructuras de la Base' : 'Base Structures'} ({totalStructures})
            </h2>
            <span className="text-[11px] text-zinc-400">
              {isEs ? 'Instalaciones municipales y edificios de soporte' : 'Municipal facilities and support buildings'}
            </span>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full font-bold">
          {typesCount} {isEs ? 'tipos' : 'types'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {Object.entries(buildingSummary).map(([type, summary]) => (
          <div
            key={type}
            className="bg-[#18181b] hover:bg-zinc-800/70 p-3 rounded-2xl shadow-md flex items-center justify-between text-xs transition-colors border-none"
          >
            <div className="min-w-0 pr-2 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-800/80 flex items-center justify-center shrink-0">
                {renderStructureIcon(type)}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-zinc-200 block truncate text-xs">
                  {formatBuildingType(type, language)}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                  {summary.count} {summary.count === 1 ? (isEs ? 'unidad' : 'unit') : (isEs ? 'unidades' : 'units')}
                </span>
              </div>
            </div>
            <span className="text-amber-400 font-mono font-bold text-[11px] bg-amber-500/10 px-2.5 py-0.5 rounded-full shrink-0">
              Nv. {summary.maxLevel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
