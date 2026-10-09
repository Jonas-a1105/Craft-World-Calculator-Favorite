import React from 'react';
import {
  formatPower,
  calculatePackStepCost,
} from '../services/powerCalculatorService';
import type { PowerPackState } from '../types';

interface PowerPacksSectionProps {
  packState: PowerPackState;
  onCapacityChange: (cap: number) => void;
  onPacks25Change: (val: number) => void;
  onPacks50Change: (val: number) => void;
  onPacks100Change: (val: number) => void;
  language: string;
}

export const PowerPacksSection: React.FC<PowerPacksSectionProps> = ({
  packState,
  onCapacityChange,
  onPacks25Change,
  onPacks50Change,
  onPacks100Change,
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="space-y-3 select-none">
      {/* Header with Max Capacity Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase">
            POWER PACKS
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            {isEs
              ? 'Calcula tu costo diario estimado por cada 100k de Power utilizando Power Packs.'
              : 'Calculate your expected daily power cost per 100k Power with Power Packs.'}
          </p>
        </div>

        {/* Max Capacity editable input */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono text-slate-400">
            {isEs ? 'Capacidad máxima' : 'Max capacity'}
          </span>
          <div className="flex items-center gap-1 bg-[#131316] px-2.5 py-1.5 rounded-xl shadow-inner font-mono text-xs">
            <input
              type="number"
              min={100_000}
              step={50_000}
              value={packState.capacity}
              onChange={(e) => onCapacityChange(parseFloat(e.target.value) || 0)}
              className="w-24 bg-transparent text-white font-bold outline-none border-none text-right"
            />
            <span className="text-slate-400 text-[11px]">kW</span>
          </div>
        </div>
      </div>

      {/* 3 Pack Cards Container */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/25 space-y-4 border-none outline-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PACK +50% (FREE) */}
          <div className="p-3.5 rounded-2xl bg-[#131316] shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                +50% pack / {isEs ? 'día' : 'day'}
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <button
                  type="button"
                  onClick={() => onPacks50Change(Math.max(0, packState.packs50PerDay - 1))}
                  disabled={packState.packs50PerDay <= 0}
                  className="w-7 h-7 rounded-lg bg-[#1c1c22] hover:bg-[#282834] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-bold text-white">
                  {packState.packs50PerDay}
                </span>
                <button
                  type="button"
                  onClick={() => onPacks50Change(Math.min(1, packState.packs50PerDay + 1))}
                  disabled={packState.packs50PerDay >= 1}
                  className="w-7 h-7 rounded-lg bg-[#1c1c22] hover:bg-[#282834] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-[11px] font-mono text-emerald-400 leading-snug">
              {isEs
                ? `Gratis — 1 reclamo diario — ${formatPower(0.5 * packState.capacity)}`
                : `Free — claim once per day — ${formatPower(0.5 * packState.capacity)}`}
            </p>
          </div>

          {/* PACK +25% */}
          <div className="p-3.5 rounded-2xl bg-[#131316] shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                +25% packs / {isEs ? 'día' : 'day'}
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <button
                  type="button"
                  onClick={() => onPacks25Change(Math.max(0, packState.packs25PerDay - 1))}
                  disabled={packState.packs25PerDay <= 0}
                  className="w-7 h-7 rounded-lg bg-[#1c1c22] hover:bg-[#282834] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-bold text-white">
                  {packState.packs25PerDay}
                </span>
                <button
                  type="button"
                  onClick={() => onPacks25Change(packState.packs25PerDay + 1)}
                  className="w-7 h-7 rounded-lg bg-[#1c1c22] hover:bg-[#282834] text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-400 leading-snug">
              50 🍃 base, +50% {isEs ? 'por compra' : 'per purchase'} — {formatPower(0.25 * packState.capacity)} {isEs ? 'c/u' : 'each'}
            </p>

            {/* Badges breakdown if packs > 0 */}
            {packState.packs25PerDay > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {Array.from({ length: packState.packs25PerDay }, (_, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#1c1c24] text-indigo-300 font-semibold shadow-inner"
                  >
                    #{i + 1}: {calculatePackStepCost(50, i + 1)} 🍃
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* PACK +100% */}
          <div className="p-3.5 rounded-2xl bg-[#131316] shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                +100% packs / {isEs ? 'día' : 'day'}
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <button
                  type="button"
                  onClick={() => onPacks100Change(Math.max(0, packState.packs100PerDay - 1))}
                  disabled={packState.packs100PerDay <= 0}
                  className="w-7 h-7 rounded-lg bg-[#1c1c22] hover:bg-[#282834] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-bold text-white">
                  {packState.packs100PerDay}
                </span>
                <button
                  type="button"
                  onClick={() => onPacks100Change(packState.packs100PerDay + 1)}
                  className="w-7 h-7 rounded-lg bg-[#1c1c22] hover:bg-[#282834] text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-400 leading-snug">
              150 🍃 base, +50% {isEs ? 'por compra' : 'per purchase'} — {formatPower(packState.capacity)} {isEs ? 'c/u' : 'each'}
            </p>

            {/* Badges breakdown if packs > 0 */}
            {packState.packs100PerDay > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {Array.from({ length: packState.packs100PerDay }, (_, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#1c1c24] text-indigo-300 font-semibold shadow-inner"
                  >
                    #{i + 1}: {calculatePackStepCost(150, i + 1)} 🍃
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
