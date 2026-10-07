import React from 'react';
import type { AdjustedCycleResult, InputSupplyMode } from '../../types';
import { useTranslation } from '../../../../utils/i18n';
import { formatNumber, formatCompactNumber } from '../../../../utils/formatters';

export interface LevelCardRowProps {
  cycle: AdjustedCycleResult;
  isOwnedLevel: boolean;
  inputSupplyMode: InputSupplyMode;
}

export const LevelCardRow: React.FC<LevelCardRowProps> = ({
  cycle: c,
  isOwnedLevel,
  inputSupplyMode,
}) => {
  const { language } = useTranslation();
  const isLoss = c.effectiveProfitPerDay < 0;

  return (
    <div
      className={`relative p-3.5 sm:p-4 rounded-[22px] transition-all ${
        isOwnedLevel
          ? 'bg-[#141416] border-[3.5px] border-emerald-400 shadow-md'
          : 'bg-[#141416] hover:bg-[#18181c] border-[3.5px] border-transparent shadow-md'
      }`}
    >
      {/* Solid Green Checkmark Badge at Top-Right Corner */}
      {isOwnedLevel && (
        <div
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-6 h-6 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-md z-10"
          title={language === 'es' ? 'Tu nivel actual' : 'Your current level'}
        >
          <svg
            className="w-4 h-4 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-5 ${
          isOwnedLevel ? 'pr-7 sm:pr-8' : ''
        }`}
      >
        {/* Left Block: Level ID, Badges, Time, XP */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <span className="font-extrabold text-white text-sm sm:text-base font-mono">
            Nv. {c.row.level}
          </span>

          {isOwnedLevel && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold inline-flex items-center gap-1">
              <svg
                className="w-3 h-3 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {language === 'es' ? 'TU NIVEL' : 'YOU'}
            </span>
          )}

          {isLoss ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold inline-flex items-center gap-1">
              <svg
                className="w-3 h-3 text-rose-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {language === 'es' ? 'Pérdida' : 'Loss'}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
              <svg
                className="w-3 h-3 text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {language === 'es' ? 'Rentable' : 'Profit'}
            </span>
          )}

          <span className="text-zinc-400 text-xs font-mono bg-[#1c1c20] px-2.5 py-1 rounded-full flex items-center gap-1">
            <svg
              className="w-3 h-3 text-zinc-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {Number(c.runtimeMinutes.toFixed(1))} min
          </span>

          {c.xpPerHour > 0 && (
            <span className="text-amber-400 text-xs font-mono font-bold bg-[#1c1c20] px-2.5 py-1 rounded-full flex items-center gap-1">
              ⭐ {formatCompactNumber(c.xpPerHour)} XP/h
            </span>
          )}
        </div>

        {/* Right/Middle Block: Insumos, Output, Ganancia/h, Ganancia/Día */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 flex-1 lg:justify-end items-center text-xs">
          {/* Insumos */}
          <div className="bg-[#101012] lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-2xl lg:rounded-none">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              {language === 'es' ? 'Insumos' : 'Inputs'}
            </span>
            <div className="font-mono font-bold flex items-baseline">
              <span className="text-amber-400">
                {c.effectiveInputCost > 0 ? `-${formatNumber(c.effectiveInputCost)}` : '0'}
              </span>
              <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
            </div>
            <span className="text-[10px] text-zinc-500 truncate block max-w-[130px]">
              {c.effectiveInputCost > 0
                ? inputSupplyMode === 'self_crafted' && c.rawBaseMaterialsText
                  ? c.rawBaseMaterialsText
                  : `${c.row.input_token_1 || ''} (${formatNumber(c.input1PerCycle, 1)})${c.row.input_token_2 ? ` + ${c.row.input_token_2}` : ''}`
                : language === 'es'
                  ? 'Sin insumos'
                  : 'No inputs'}
            </span>
          </div>

          {/* Output */}
          <div className="bg-[#101012] lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-2xl lg:rounded-none">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              {language === 'es' ? 'Output (Venta)' : 'Output'}
            </span>
            <div className="font-mono font-bold flex items-baseline">
              <span className="text-white">+{formatNumber(c.revenuePerCycle)}</span>
              <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
            </div>
            <span className="text-[10px] text-zinc-500 truncate block">
              {c.row.output_token} ({formatNumber(c.outputPerCycle, 1)})
            </span>
          </div>

          {/* Ganancia / Hora */}
          <div className="bg-[#101012] lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-2xl lg:rounded-none">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              {language === 'es' ? 'Ganancia / h' : 'Profit / h'}
            </span>
            <div className="font-mono font-bold text-xs sm:text-sm flex items-baseline">
              <span className={isLoss ? 'text-rose-400' : 'text-emerald-400'}>
                {c.effectiveProfitPerHour > 0 ? '+' : ''}
                {formatNumber(c.effectiveProfitPerHour)}
              </span>
              <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
            </div>
          </div>

          {/* Ganancia / Día */}
          <div className="bg-[#101012] lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-2xl lg:rounded-none">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
            </span>
            <div className="font-mono font-bold text-xs sm:text-sm flex items-baseline">
              <span className={isLoss ? 'text-rose-400' : 'text-emerald-400'}>
                {c.effectiveProfitPerDay > 0 ? '+' : ''}
                {formatNumber(c.effectiveProfitPerDay)}
              </span>
              <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
