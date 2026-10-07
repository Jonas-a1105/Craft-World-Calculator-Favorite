import React from 'react';
import type { FactoryCycleResult } from '../../../services/craftworldCalculations';
import { FactoryIcon, ResourceIcon } from '../../../components/GameIcon';
import { formatNumber, formatCompactNumber } from '../../../utils/formatters';

export interface FactoryDetailCardProps {
  optionLabel: 'A' | 'B';
  cycle: FactoryCycleResult;
  language: 'es' | 'en';
}

export const FactoryDetailCard: React.FC<FactoryDetailCardProps> = ({
  optionLabel,
  cycle,
  language,
}) => {
  const isA = optionLabel === 'A';
  const levelColor = isA ? 'text-sky-400' : 'text-amber-400';

  return (
    <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
      {/* Top: Factory Info + Profit/Day */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#141416] flex items-center justify-center shadow-inner">
            <FactoryIcon symbol={cycle.row.token} size={28} />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-base uppercase tracking-wide">
              {cycle.row.token}
            </h4>
            <span className={`text-xs font-mono font-bold ${levelColor}`}>
              Nv. {cycle.row.level}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">
            {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
          </span>
          <div className="font-mono font-black text-base flex items-baseline justify-end">
            <span
              className={
                cycle.profitPerDay >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }
            >
              {cycle.profitPerDay > 0 ? '+' : ''}
              {formatNumber(cycle.profitPerDay)}
            </span>
            <span className="text-amber-400 font-bold text-xs ml-1">COIN</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        {/* Ganancia / Hora */}
        <div className="bg-[#141416] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
          </span>
          <div className="font-mono font-bold flex items-baseline mt-0.5">
            <span
              className={
                cycle.profitPerHour >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }
            >
              {cycle.profitPerHour > 0 ? '+' : ''}
              {formatNumber(cycle.profitPerHour)}
            </span>
            <span className="text-amber-400 font-semibold text-[11px] ml-1">
              COIN
            </span>
          </div>
        </div>

        {/* Output / Día */}
        <div className="bg-[#141416] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'Output / Día' : 'Output / Day'}
          </span>
          <div className="font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
            <ResourceIcon symbol={cycle.row.output_token} size={15} />
            <span>{formatNumber(cycle.outputPerDay)}</span>
            <span className="text-zinc-400 text-[11px]">
              {cycle.row.output_token}
            </span>
          </div>
        </div>

        {/* Insumos / Ciclo */}
        <div className="bg-[#141416] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'Costo Insumos / Ciclo' : 'Inputs Cost / Cycle'}
          </span>
          <div className="font-mono font-bold flex items-baseline mt-0.5">
            <span className="text-amber-400">
              {cycle.inputCostPerCycle > 0
                ? `-${formatNumber(cycle.inputCostPerCycle)}`
                : '0'}
            </span>
            <span className="text-amber-400 font-semibold text-[11px] ml-1">
              COIN
            </span>
          </div>
        </div>

        {/* Tiempo de Ciclo */}
        <div className="bg-[#141416] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'Tiempo de Ciclo' : 'Cycle Duration'}
          </span>
          <span className="font-mono font-bold text-white block mt-0.5">
            {Number(cycle.runtimeMinutes.toFixed(1))} min
          </span>
        </div>

        {/* Margen */}
        <div className="bg-[#141416] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'Margen de Margen' : 'Profit Margin'}
          </span>
          <span
            className={`font-mono font-bold block mt-0.5 ${
              cycle.marginPercent && cycle.marginPercent < 0
                ? 'text-rose-400'
                : 'text-cyan-400'
            }`}
          >
            {typeof cycle.marginPercent === 'number'
              ? `${cycle.marginPercent > 0 ? '+' : ''}${cycle.marginPercent.toFixed(0)}%`
              : '100%'}
          </span>
        </div>

        {/* XP / Día */}
        <div className="bg-[#141416] p-3 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'XP Ganada / Día' : 'Daily XP'}
          </span>
          <span className="font-mono font-bold text-amber-300 block mt-0.5">
            +{formatCompactNumber(cycle.xpPerDay)} XP
          </span>
        </div>
      </div>
    </div>
  );
};
