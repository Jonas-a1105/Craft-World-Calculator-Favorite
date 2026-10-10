import React from 'react';
import type { PlannerViewTab, MaterialFilter, PlannerKpiStats } from '../types';
import { useTranslation } from '../../../utils/i18n';
import {
  BoxBold,
  BoltBold,
  CopyBold,
  CheckCircleBold,
  CartLargeBoldDuotone,
  BoltBoldDuotone,
} from 'solar-icon-set';

export interface PlannerTabsNavProps {
  viewTab: PlannerViewTab;
  setViewTab: (tab: PlannerViewTab) => void;
  materialFilter: MaterialFilter;
  setMaterialFilter: (filter: MaterialFilter) => void;
  kpiStats: PlannerKpiStats;
  craftingStepsCount: number;
  copiedNotification: boolean;
  onCopyMissing: () => void;
}

export const PlannerTabsNav: React.FC<PlannerTabsNavProps> = ({
  viewTab,
  setViewTab,
  materialFilter,
  setMaterialFilter,
  kpiStats,
  craftingStepsCount,
  copiedNotification,
  onCopyMissing,
}) => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-white/[0.06] pb-4 select-none">
      {/* 1. View Switcher Tabs (Plano de Recursos vs Secuencia de Fábricas) */}
      <div className="flex items-center gap-1.5 bg-[#18181b] p-1.5 rounded-2xl w-full md:w-auto">
        <button
          type="button"
          onClick={() => setViewTab('materials')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
            viewTab === 'materials'
              ? 'bg-amber-500 text-black shadow-lg font-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <BoxBold className="w-4 h-4 shrink-0" />
          <span>
            {isEs ? 'Plano de Recursos' : 'Resource Blueprint'} ({kpiStats.totalTypes})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab('steps')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
            viewTab === 'steps'
              ? 'bg-amber-500 text-black shadow-lg font-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <BoltBold className="w-4 h-4 shrink-0" />
          <span>
            {isEs ? 'Secuencia de Fábricas' : 'Factory Sequence'} ({craftingStepsCount})
          </span>
        </button>
      </div>

      {/* 2. Utility Actions (Filter Pills + Copy Deficits) */}
      {viewTab === 'materials' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full md:w-auto">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#18181b] p-1.5 rounded-2xl text-xs w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setMaterialFilter('all')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer border-none shrink-0 ${
                materialFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isEs ? 'Todos' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setMaterialFilter('sell_buy')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer border-none shrink-0 ${
                materialFilter === 'sell_buy'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm font-black'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              <span>{isEs ? 'Vender y Comprar' : 'Sell & Buy'}</span>
              {kpiStats.sellBuyStepsCount > 0 && (
                <span className="font-mono">({kpiStats.sellBuyStepsCount})</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMaterialFilter('convert')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer border-none shrink-0 ${
                materialFilter === 'convert'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm font-black'
                  : 'text-zinc-400 hover:text-cyan-300'
              }`}
            >
              <span>{isEs ? 'Convertir Fábrica' : 'Convert in Factory'}</span>
              {kpiStats.convertStepsCount > 0 && (
                <span className="font-mono">({kpiStats.convertStepsCount})</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMaterialFilter('missing')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer border-none shrink-0 ${
                materialFilter === 'missing'
                  ? 'bg-rose-500/20 text-rose-300 shadow-sm font-black'
                  : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              {isEs ? 'Faltantes' : 'Missing'}
            </button>
            <button
              type="button"
              onClick={() => setMaterialFilter('ready')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer border-none shrink-0 ${
                materialFilter === 'ready'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm font-black'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              {isEs ? 'Almacén' : 'Stock'}
            </button>
          </div>

          {/* Copy Missing Button */}
          <div className="flex justify-end w-full sm:w-auto">
            <button
              type="button"
              onClick={onCopyMissing}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border-none shadow-sm ${
                copiedNotification
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              {copiedNotification ? (
                <CheckCircleBold className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <CopyBold className="w-4 h-4 text-zinc-400 shrink-0" />
              )}
              <span className="whitespace-nowrap font-extrabold">
                {copiedNotification
                  ? isEs
                    ? '¡Copiado!'
                    : 'Copied!'
                  : isEs
                    ? 'Copiar Faltantes'
                    : 'Copy Missing'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
