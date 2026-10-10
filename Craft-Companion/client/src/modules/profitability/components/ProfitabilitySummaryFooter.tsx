import React from 'react';
import { useTranslation } from '../../../utils/i18n';
import type { ProfitabilitySummaryTotals } from '../types';
import { formatNumber } from '../../../utils/formatters';

interface ProfitabilitySummaryFooterProps {
  totals: ProfitabilitySummaryTotals;
}

export const ProfitabilitySummaryFooter: React.FC<ProfitabilitySummaryFooterProps> = ({
  totals,
}) => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const isProfitable = totals.totalProfitPerHour > 0;
  const isLoss = totals.totalProfitPerHour < 0;

  return (
    <div className="sticky bottom-4 z-30 w-full max-w-4xl mx-auto px-4 pointer-events-none">
      <div className="bg-[#121215]/95 backdrop-blur-md rounded-[32px] p-4 sm:p-5 shadow-2xl pointer-events-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left Stats: Active Factories & Power Consumed */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
              {isEs ? 'Fábricas Activas' : 'Active Factories'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-black text-white tabular-nums">
                {totals.totalActiveFactories}
              </span>
              <span className="text-xs text-zinc-400">
                ({totals.totalActiveTokens} {isEs ? 'tipos' : 'types'})
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800 hidden sm:block" />

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
              {isEs ? 'Consumo de Energía' : 'Total Power'}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-zinc-300 tabular-nums mt-0.5 block">
              {formatNumber(totals.totalPowerKwPerHour, 1)} kW/h
            </span>
          </div>
        </div>

        {/* Right Headline: TOTAL PROFIT / H (Matching Reference Screenshot) */}
        <div className="text-right">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-zinc-400 block">
            {isEs ? 'GANANCIA TOTAL / HORA' : 'TOTAL PROFIT / H'}
          </span>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span
              className={`text-lg sm:text-2xl font-black tabular-nums tracking-tight ${
                isProfitable
                  ? 'text-emerald-400'
                  : isLoss
                    ? 'text-rose-400'
                    : 'text-zinc-300'
              }`}
            >
              {isProfitable ? '+' : ''}
              {formatNumber(totals.totalProfitPerHour, 2)}
            </span>
            <span className="text-amber-400 text-sm sm:text-base font-black flex items-center gap-1">
              <span>COIN</span>
              <svg className="w-4 h-4 text-amber-400 inline" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                <text x="12" y="16" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">C</text>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
