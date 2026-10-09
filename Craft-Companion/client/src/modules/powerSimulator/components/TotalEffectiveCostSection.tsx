import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatPower, formatCoin } from '../services/powerCalculatorService';
import type { PowerSimulatorSummary } from '../types';

interface TotalEffectiveCostSectionProps {
  summary: PowerSimulatorSummary;
  activateCrystalPass: boolean;
  onToggleCrystalPass: () => void;
  language: string;
}

export const TotalEffectiveCostSection: React.FC<TotalEffectiveCostSectionProps> = ({
  summary,
  activateCrystalPass,
  onToggleCrystalPass,
  language,
}) => {
  const isEs = language === 'es';

  const {
    freePowerDaily,
    paidPowerDaily,
    totalDailyPower,
    totalCrystalsDaily,
    effectiveTotalCostCoin,
    effectiveCoinPer100k,
  } = summary;

  const freeFraction = totalDailyPower > 0 ? freePowerDaily / totalDailyPower : 0;
  const paidFraction = totalDailyPower > 0 ? paidPowerDaily / totalDailyPower : 0;

  return (
    <div className="space-y-3 select-none">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase">
            {isEs ? 'COSTO EFECTIVO TOTAL / 100K POWER' : 'TOTAL EFFECTIVE COST / 100K POWER'}
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            {isEs
              ? 'Tu costo promedio diario de energía, incluyendo Power Packs y Plantas Pasivas.'
              : 'Your average daily power cost, including Power Packs and Passive Plants.'}
          </p>
        </div>

        {/* Crystal Pass Toggle Pill */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#1c1c22] hover:bg-[#23232c] transition-all cursor-pointer shadow-inner self-start sm:self-auto border-none">
          <input
            type="checkbox"
            checked={activateCrystalPass}
            onChange={onToggleCrystalPass}
            className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
          />
          <span className="text-xs font-mono font-bold text-slate-200">
            {isEs ? 'Activar tasa Crystal Pass' : 'Activate Crystal Pass rate'}
          </span>
          <span
            className="text-[10px] text-slate-400 font-mono"
            title={
              isEs
                ? 'Los primeros 150 cristales diarios se cobran a tarifa con descuento ($14.99 / 30 días).'
                : 'The first 150 crystals spent per day are priced at the Crystal Pass rate ($14.99 / 30 days).'
            }
          >
            ℹ️
          </span>
        </label>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/25 space-y-4 border-none outline-none">
        {/* Combined Daily Power Bars */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            {isEs ? 'ENERGÍA DIARIA COMBINADA' : 'COMBINED DAILY POWER'}
          </span>

          <div className="space-y-2 font-mono text-xs">
            {/* Free Passive Bar */}
            {freePowerDaily > 0 && (
              <div className="flex items-center gap-3">
                <span className="w-28 text-[11px] text-slate-300 font-medium shrink-0 truncate">
                  {isEs ? 'Pasiva (gratis)' : 'Passive (free)'}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#131316] overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(4, freeFraction * 100)}%` }}
                  />
                </div>
                <span className="w-24 text-right text-xs font-bold text-emerald-400 shrink-0">
                  {formatPower(freePowerDaily)} / {isEs ? 'día' : 'day'}
                </span>
              </div>
            )}

            {/* Paid Power Packs Bar */}
            {paidPowerDaily > 0 && (
              <div className="flex items-center gap-3">
                <span className="w-28 text-[11px] text-slate-300 font-medium shrink-0 truncate">
                  Power Packs
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#131316] overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-all duration-300"
                    style={{ width: `${Math.max(4, paidFraction * 100)}%` }}
                  />
                </div>
                <span className="w-24 text-right text-xs font-bold text-indigo-400 shrink-0">
                  {formatPower(paidPowerDaily)} / {isEs ? 'día' : 'day'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 font-mono">
          {/* Total Power */}
          <div className="p-3.5 rounded-2xl bg-[#131316] shadow-inner">
            <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
              {isEs ? 'Energía total / día' : 'Total power / day'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-[#38BDF8]">
                {formatPower(totalDailyPower)}
              </span>
              <span className="text-xs text-slate-500">kW</span>
            </div>
          </div>

          {/* Total Cost */}
          <div className="p-3.5 rounded-2xl bg-[#131316] shadow-inner">
            <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
              {isEs ? 'Costo total / día' : 'Total cost / day'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg font-black text-indigo-300">
                {totalCrystalsDaily} 🍃
              </span>
              {effectiveTotalCostCoin !== null && (
                <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
                  <span>≈ {formatCoin(effectiveTotalCostCoin)}</span>
                  <ResourceIcon symbol="COIN" size={12} />
                </div>
              )}
            </div>
          </div>

          {/* Effective COIN / 100k */}
          <div className="p-3.5 rounded-2xl bg-[#131316] ring-1 ring-rose-500/30 shadow-inner">
            <span className="text-[10px] text-rose-400 uppercase font-bold tracking-tight block">
              {isEs ? 'Costo Efectivo / 100k' : 'Effective COIN / 100k'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-rose-400">
                {formatCoin(effectiveCoinPer100k)}
              </span>
              <span className="text-xs text-slate-400 font-bold">COIN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
