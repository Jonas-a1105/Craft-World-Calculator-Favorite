import React from 'react';
import { LevelProgression } from '../types';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatCompact, formatWithCommas } from '../utils/formatters';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  row: LevelProgression;
}

export const LevelCard: React.FC<Props> = ({ row }) => {
  const { language } = useTranslation();

  return (
    <div className="w-full bg-[#18181c] hover:bg-[#1f1f25] p-3.5 sm:p-4 rounded-[24px] sm:rounded-[28px] transition-all duration-150 select-none shadow-md border-none text-slate-300 space-y-3">
      {/* Top Strip: Level, Upgrade Cost, Inputs & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5">
        {/* Left: Level + Upgrade Cost */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#121215] flex items-center justify-center shrink-0 shadow-inner">
            <span className="font-mono text-xs sm:text-sm font-bold text-amber-400">
              {row.level}
            </span>
          </div>

          {/* Upgrade Cost */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
              {language === 'es' ? 'Mejora:' : 'Upgrade:'}
            </span>
            {row.upgradeCostToken && row.upgradeCostAmount > 0 ? (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  row.isMaterialSwitch
                    ? 'bg-indigo-600/30 ring-1 ring-indigo-400/50 text-indigo-200'
                    : 'bg-[#121215]/80 text-slate-100'
                }`}
              >
                <ResourceIcon symbol={row.upgradeCostToken} size={15} />
                <span className="font-bold">
                  {formatWithCommas(row.upgradeCostAmount)}
                </span>
                {row.upgradeCostDiff !== undefined && row.upgradeCostDiff > 0 && (
                  <span className="text-emerald-400 text-[10px]">
                    (+{formatWithCommas(row.upgradeCostDiff)})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-500 font-medium px-2 py-0.5 bg-[#121215] rounded-full">—</span>
            )}
          </div>
        </div>

        {/* Middle: Recipe Inputs & Daily Consumption */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
            {language === 'es' ? 'Insumos / ciclo:' : 'Inputs / cycle:'}
          </span>
          {row.input1Token && (row.input1Amount ?? 0) > 0 ? (
            <div className="inline-flex items-center gap-2 bg-[#121215]/80 px-2.5 py-1 rounded-full text-xs font-mono">
              <div className="inline-flex items-center gap-1">
                <ResourceIcon symbol={row.input1Token} size={14} />
                <span className="font-semibold text-slate-200">{formatWithCommas(row.input1Amount ?? 0)}</span>
              </div>
              {row.input2Token && (row.input2Amount ?? 0) > 0 && (
                <>
                  <span className="text-slate-600">+</span>
                  <div className="inline-flex items-center gap-1">
                    <ResourceIcon symbol={row.input2Token} size={14} />
                    <span className="font-semibold text-slate-200">{formatWithCommas(row.input2Amount ?? 0)}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono bg-[#121215] px-2.5 py-0.5 rounded-full">
              {language === 'es' ? 'Sin insumos' : 'No inputs'}
            </span>
          )}

          {/* Input Daily Consumption */}
          {row.input1DailyConsumption !== undefined && row.input1DailyConsumption > 0 && (
            <div className="text-[11px] text-slate-400 font-mono hidden sm:inline-flex items-center gap-1 bg-[#121215]/60 px-2 py-0.5 rounded-full">
              <span className="text-slate-500">{language === 'es' ? 'Gasto/d:' : 'Burn/d:'}</span>
              <span className="text-amber-300 font-semibold">{formatCompact(row.input1DailyConsumption)}</span>
              {row.input2DailyConsumption !== undefined && row.input2DailyConsumption > 0 && (
                <>
                  <span className="text-slate-600">+</span>
                  <span className="text-amber-300 font-semibold">{formatCompact(row.input2DailyConsumption)}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Yield, Growth & Building Badges */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0 ml-auto">
          {row.capacity !== undefined && row.capacity > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border-none text-[10px] font-mono flex items-center">
              <svg className="w-3 h-3 text-amber-400 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="20" y1="11" x2="20" y2="13"/></svg>
              Cap. {formatCompact(row.capacity)}
            </span>
          )}
          {row.residents !== undefined && row.residents > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border-none text-[10px] font-mono font-semibold flex items-center">
              <svg className="w-3 h-3 text-emerald-400 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              {row.residents} {language === 'es' ? 'Hab.' : 'Res.'}
            </span>
          )}
          {row.slots !== undefined && row.slots > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border-none text-[10px] font-mono font-semibold flex items-center">
              <svg className="w-3 h-3 text-purple-400 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Slots: {row.slots}
            </span>
          )}
          {row.requiredTownHallLevel !== undefined && row.requiredTownHallLevel > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#121215] text-[10px] font-mono text-amber-300 border-none flex items-center">
              <svg className="w-3 h-3 text-amber-300 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2l9 8H3l9-8z"/></svg>
              TH {row.requiredTownHallLevel}
            </span>
          )}
          {row.unlockLevel !== undefined && row.unlockLevel > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#121215] text-[10px] font-mono text-sky-300 border-none flex items-center">
              <svg className="w-3 h-3 text-sky-300 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
              Niv. {row.unlockLevel}
            </span>
          )}
          {row.maxCount !== undefined && row.maxCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#121215] text-[10px] font-mono text-slate-400 border-none">
              {language === 'es' ? 'Máx:' : 'Max:'} {row.maxCount}
            </span>
          )}
          {row.yieldPercent !== undefined && row.yieldPercent > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#121215] text-[10px] font-mono text-slate-300 border-none">
              Yield {row.yieldPercent}%
            </span>
          )}
          {row.productionChange !== undefined && row.productionChange > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border-none text-[10px] font-mono font-semibold">
              +{row.productionChange.toFixed(1)}% {language === 'es' ? 'crec.' : 'growth'}
            </span>
          )}
        </div>
      </div>

      {/* Main Stats Grid: 6 columns utilizing full width */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 text-xs font-mono pt-0.5">
        {/* 1. Duration */}
        <div className="bg-[#121215]/60 rounded-2xl p-2.5 flex flex-col justify-between border-none">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {language === 'es' ? 'Duración' : 'Duration'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-slate-200 font-semibold text-xs sm:text-sm">
              {row.durationRaw || row.durationFormatted}
            </span>
            {row.durationDiffFormatted && (
              <span className="text-emerald-400 text-[10px] font-normal">
                {row.durationDiffFormatted}
              </span>
            )}
          </div>
        </div>

        {/* 2. Output per cycle */}
        <div className="bg-[#121215]/60 rounded-2xl p-2.5 flex flex-col justify-between border-none">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {row.capacity !== undefined && row.capacity > 0
              ? (language === 'es' ? 'Capacidad' : 'Capacity')
              : row.residents !== undefined && row.residents > 0
                ? (language === 'es' ? 'Habitantes' : 'Residents')
                : row.slots !== undefined && row.slots > 0
                  ? (language === 'es' ? 'Espacios' : 'Slots')
                  : (language === 'es' ? 'Producción' : 'Output / cycle')}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-slate-200 font-semibold text-xs sm:text-sm">
              {row.capacity !== undefined && row.capacity > 0
                ? formatCompact(row.capacity)
                : row.residents !== undefined && row.residents > 0
                  ? row.residents
                  : row.slots !== undefined && row.slots > 0
                    ? row.slots
                    : formatWithCommas(row.outputAmount)}
            </span>
            {row.outputDiff !== undefined && (
              <span className="text-emerald-400 text-[10px] font-normal">
                +{formatWithCommas(row.outputDiff)}
              </span>
            )}
          </div>
        </div>

        {/* 3. Daily Production */}
        <div className="bg-[#121215]/60 rounded-2xl p-2.5 flex flex-col justify-between border-none">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {language === 'es' ? 'Prod / Día' : 'Daily Output'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-emerald-400 font-bold text-xs sm:text-sm">
              {formatCompact(row.prodPerDay)}
            </span>
            {row.prodPerDayDiff !== undefined && row.prodPerDayDiff > 0 && (
              <span className="text-emerald-300 text-[10px] font-normal">
                +{formatCompact(row.prodPerDayDiff)}
              </span>
            )}
          </div>
        </div>

        {/* 4. Power */}
        <div className="bg-[#121215]/60 rounded-2xl p-2.5 flex flex-col justify-between border-none">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium flex items-center justify-between">
            <span>{language === 'es' ? 'Energía' : 'Power'}</span>
            <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-amber-400 font-bold text-xs sm:text-sm">
              {row.power >= 1000 ? formatCompact(row.power) : (row.power > 0 ? row.power : '—')}
            </span>
            {row.powerDiff !== undefined && row.powerDiff !== 0 && (
              <span className="text-emerald-400 text-[10px] font-normal">
                +{row.powerDiff >= 1000 ? formatCompact(row.powerDiff) : row.powerDiff}
              </span>
            )}
          </div>
          {row.powerPerUnit !== undefined && row.powerPerUnit > 0 ? (
            <span className="text-[9px] text-slate-500 mt-0.5">
              {row.powerPerUnit} / u
            </span>
          ) : (
            <span className="text-[9px] text-slate-600 mt-0.5">0 / u</span>
          )}
        </div>

        {/* 5. XP / Day or Training Time */}
        <div className="bg-[#121215]/60 rounded-2xl p-2.5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {row.trainingTime
              ? (language === 'es' ? 'Formación' : 'Training')
              : row.powerRecoveryStep
                ? (language === 'es' ? 'Recuperación' : 'Recovery')
                : (language === 'es' ? 'XP / Día' : 'XP / Day')}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-purple-300 font-semibold text-xs sm:text-sm">
              {row.trainingTime || row.powerRecoveryStep || (row.xpPerDay && row.xpPerDay > 0 ? formatCompact(row.xpPerDay) : '—')}
            </span>
          </div>
          {row.xpPerOutput !== undefined && row.xpPerOutput > 0 ? (
            <span className="text-[9px] text-slate-500 mt-0.5">
              {formatCompact(row.xpPerOutput)} / u
            </span>
          ) : (
            <span className="text-[9px] text-slate-600 mt-0.5">— / u</span>
          )}
        </div>

        {/* 6. XP / Battery & Burn */}
        <div className="bg-[#121215]/60 rounded-2xl p-2.5 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {language === 'es' ? 'XP / Batería' : 'XP / Battery'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-indigo-300 font-semibold text-xs sm:text-sm">
              {row.xpPerBattery !== undefined && row.xpPerBattery > 0 ? row.xpPerBattery : '—'}
            </span>
          </div>
          {row.input1DailyConsumption !== undefined && row.input1DailyConsumption > 0 ? (
            <span className="text-[9px] text-slate-500 mt-0.5 truncate" title={`Gasto: ${formatCompact(row.input1DailyConsumption)} / d`}>
              {formatCompact(row.input1DailyConsumption)} in/d
            </span>
          ) : (
            <span className="text-[9px] text-slate-600 mt-0.5">— in/d</span>
          )}
        </div>
      </div>
    </div>
  );
};
