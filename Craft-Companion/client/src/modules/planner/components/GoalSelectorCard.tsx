import React from 'react';
import type { PlannerKpiStats } from '../types';
import { useTranslation } from '../../../utils/i18n';
import { formatNumber } from '../../../utils/formatters';
import { Combobox } from '../../../components/ui/Combobox';

export interface GoalSelectorCardProps {
  targetToken: string;
  setTargetToken: (tok: string) => void;
  targetAmount: number;
  setTargetAmount: (val: number | ((prev: number) => number)) => void;
  tokenOptions: Array<{ value: string; label: string; icon: React.ReactNode }>;
  userResources: Record<string, number>;
  kpiStats: PlannerKpiStats;
}

export const GoalSelectorCard: React.FC<GoalSelectorCardProps> = ({
  targetToken,
  setTargetToken,
  targetAmount,
  setTargetAmount,
  tokenOptions,
  userResources,
  kpiStats,
}) => {
  const { language } = useTranslation();

  return (
    <div className="bg-[#18181b] rounded-[32px] p-6 sm:p-7 shadow-xl border-none space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'es' ? 'Meta de Producción' : 'Production Goal'}
            </h2>
            <span className="text-xs text-zinc-400">
              {language === 'es'
                ? 'Selecciona el artículo final y la cantidad a fabricar'
                : 'Choose the final product and quantity to produce'}
            </span>
          </div>
        </div>

        {/* In Inventory of Target Item Indicator */}
        {userResources[targetToken] !== undefined && (
          <div className="flex items-center gap-2 bg-[#141416] px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-300">
            <span className="text-zinc-400">
              {language === 'es' ? 'En almacén:' : 'In storage:'}
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              {formatNumber(userResources[targetToken])}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        {/* Target Resource Combobox */}
        <div className="md:col-span-6 space-y-2 min-w-0">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
            {language === 'es' ? 'Recurso Objetivo' : 'Target Resource'}
          </label>
          <Combobox
            value={targetToken}
            onChange={(val) => setTargetToken(val as string)}
            options={tokenOptions}
            placeholder={
              language === 'es'
                ? 'Seleccionar recurso...'
                : 'Select resource...'
            }
            className="w-full !py-3 !px-4.5 bg-[#141416] hover:bg-[#19191d] rounded-full text-sm font-bold text-white shadow-inner"
            menuClassName="w-full max-h-72"
          />
        </div>

        {/* Target Amount Input & Presets */}
        <div className="md:col-span-6 space-y-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
              {language === 'es' ? 'Cantidad Deseada' : 'Desired Amount'}
            </label>
            <div className="flex items-center gap-1 flex-wrap">
              {[1, 5, 10, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetAmount(preset)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer border-none flex-shrink-0 ${
                    targetAmount === preset
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-[#202024] text-zinc-400 hover:text-white hover:bg-[#28282e]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full min-w-0">
            <button
              type="button"
              onClick={() => setTargetAmount((prev) => Math.max(1, prev - 1))}
              className="w-10 h-10 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-300 hover:text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer border-none"
              title="-1"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={targetAmount}
              onChange={(e) =>
                setTargetAmount(Math.max(1, Number(e.target.value) || 1))
              }
              className="flex-1 min-w-0 w-full bg-[#141416] text-white text-center font-mono font-bold text-base py-2.5 px-3 rounded-full border-none outline-none focus:ring-2 focus:ring-sky-500/50 shadow-inner"
            />
            <button
              type="button"
              onClick={() => setTargetAmount((prev) => prev + 1)}
              className="w-10 h-10 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-300 hover:text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer border-none"
              title="+1"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Strip (4 KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* KPI 1: Insumos Totales */}
        <div className="bg-[#141416] rounded-[24px] p-3.5 flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {language === 'es' ? 'Tipos de Insumo' : 'Material Types'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-white font-mono">
              {kpiStats.totalTypes}
            </span>
            <span className="text-xs text-zinc-500">
              {language === 'es' ? 'materiales' : 'items'}
            </span>
          </div>
        </div>

        {/* KPI 2: Cobertura */}
        <div className="bg-[#141416] rounded-[24px] p-3.5 flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {language === 'es' ? 'En Inventario' : 'In Stock'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-extrabold font-mono ${
                kpiStats.canCraftInstantly
                  ? 'text-emerald-400'
                  : kpiStats.completionPercent >= 50
                    ? 'text-sky-400'
                    : 'text-amber-400'
              }`}
            >
              {kpiStats.readyTypes}/{kpiStats.totalTypes}
            </span>
            <span className="text-xs text-zinc-400 font-bold">
              ({kpiStats.completionPercent}%)
            </span>
          </div>
        </div>

        {/* KPI 3: Faltantes */}
        <div className="bg-[#141416] rounded-[24px] p-3.5 flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {language === 'es' ? 'Faltantes' : 'Missing'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-extrabold font-mono ${
                kpiStats.totalMissingItems === 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {formatNumber(kpiStats.totalMissingItems)}
            </span>
            <span className="text-xs text-zinc-500">
              {language === 'es' ? 'unidades' : 'units'}
            </span>
          </div>
        </div>

        {/* KPI 4: Costo de Mercado Estimado */}
        <div className="bg-[#141416] rounded-[24px] p-3.5 flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {language === 'es' ? 'Costo Faltantes' : 'Deficit Cost'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-extrabold font-mono ${
                kpiStats.totalMissingCost === 0
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {kpiStats.totalMissingCost === 0
                ? '0'
                : `~${formatNumber(Math.round(kpiStats.totalMissingCost))}`}
            </span>
            <span className="text-xs text-zinc-500">COIN</span>
          </div>
        </div>
      </div>
    </div>
  );
};
