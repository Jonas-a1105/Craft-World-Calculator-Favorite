import React from 'react';
import { LevelProgression, TableViewMode } from '../types';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatCompact, formatWithCommas } from '../utils/formatters';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  row: LevelProgression;
  viewMode: TableViewMode;
}

export const LevelCard: React.FC<Props> = ({ row, viewMode }) => {
  const { language } = useTranslation();

  return (
    <div className="w-full bg-[#18181c] hover:bg-[#202026] p-2.5 sm:p-3 pr-4 sm:pr-6 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-150 select-none shadow-md border-none text-slate-300">
      {/* Left Section: Circular Level Badge & Upgrade Cost */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
        {/* Circular Level Badge */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#121215] flex items-center justify-center shrink-0 shadow-inner">
          <span className="font-mono text-xs sm:text-sm font-bold text-amber-400">
            {row.level}
          </span>
        </div>

        {/* Upgrade Cost */}
        <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
          {row.upgradeCostToken && row.upgradeCostAmount > 0 ? (
            <div className="inline-flex items-center gap-1.5 bg-[#121215]/60 px-2.5 py-1 rounded-full">
              <ResourceIcon symbol={row.upgradeCostToken} size={16} />
              <span className="font-bold text-slate-100">
                {formatWithCommas(row.upgradeCostAmount)}
              </span>
            </div>
          ) : (
            <span className="text-slate-500 font-medium px-2 py-1">—</span>
          )}
        </div>
      </div>

      {/* Right / Middle: Horizontal Data Columns */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 md:gap-8 flex-wrap sm:flex-nowrap text-xs font-mono grow">
        {/* Duration */}
        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {language === 'es' ? 'Duración' : 'Duration'}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-slate-200 font-semibold">{row.durationFormatted}</span>
            {row.durationDiffFormatted && (
              <span className="text-emerald-400 text-[10px] font-normal">
                {row.durationDiffFormatted}
              </span>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {language === 'es' ? 'Producción' : 'Output'}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-slate-200 font-semibold">{formatWithCommas(row.outputAmount)}</span>
            {row.outputDiff !== undefined && (
              <span className="text-emerald-400 text-[10px] font-normal">
                +{formatWithCommas(row.outputDiff)}
              </span>
            )}
          </div>
        </div>

        {/* Power */}
        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {language === 'es' ? 'Energía' : 'Power'}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-amber-400 font-bold">{row.power}</span>
            {row.powerDiff !== undefined && (
              <span className="text-emerald-400 text-[10px] font-normal">
                +{row.powerDiff}
              </span>
            )}
          </div>
        </div>

        {/* Prod / Day */}
        <div className="flex flex-col sm:items-end min-w-[70px]">
          <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
            {language === 'es' ? 'Prod / Día' : 'Prod/Day'}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{formatCompact(row.prodPerDay)}</span>
            {row.prodPerDayDiff !== undefined && (
              <span className="text-emerald-300 text-[10px] font-normal">
                +{formatCompact(row.prodPerDayDiff)}
              </span>
            )}
          </div>
        </div>

        {/* Inputs (for 'All' mode) */}
        {viewMode === 'all' && row.input1Token && row.input1Amount ? (
          <div className="flex flex-col sm:items-end">
            <span className="text-[10px] text-slate-500 font-sans uppercase font-medium">
              {language === 'es' ? 'Entradas' : 'Inputs'}
            </span>
            <div className="inline-flex items-center gap-1">
              <ResourceIcon symbol={row.input1Token} size={13} />
              <span>{row.input1Amount}</span>
              {row.input2Token && row.input2Amount ? (
                <>
                  <span className="text-slate-600">+</span>
                  <ResourceIcon symbol={row.input2Token} size={13} />
                  <span>{row.input2Amount}</span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
