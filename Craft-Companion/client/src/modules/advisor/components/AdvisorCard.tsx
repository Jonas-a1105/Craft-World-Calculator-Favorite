import React from 'react';
import { FactoryIcon, ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import type { UpgradeRecommendation } from '../types';

interface AdvisorCardProps {
  rec: UpgradeRecommendation;
  language: string;
}

export const AdvisorCard: React.FC<AdvisorCardProps> = ({ rec, language }) => {
  return (
    <div className="p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] bg-[#18181b] hover:bg-[#1f1f23] transition-all border-none shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
      {/* Left: Icon + Factory Info + Level progression + Reason */}
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#141416] flex items-center justify-center flex-shrink-0 shadow-inner">
          <FactoryIcon symbol={rec.row.token} size={36} />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-white text-base sm:text-lg tracking-wide uppercase">
              {rec.row.token}
            </h3>

            {/* Level Progression Pill */}
            <span className="px-2.5 py-1 rounded-full bg-[#141416] text-zinc-200 text-xs font-mono font-bold">
              Nv. {rec.row.level} ➔ Nv. {rec.row.level + 1}
            </span>

            {/* Payback Days Badge */}
            {rec.paybackDays !== null && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
                  {language === 'es'
                    ? `Retorno en ${formatNumber(rec.paybackDays, 1)} días`
                    : `ROI in ${formatNumber(rec.paybackDays, 1)} days`}
                </span>
              </span>
            )}

            {/* Recommendation Label Badge */}
            {rec.label && rec.label !== 'Not enough data' && (
              <span className="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 text-[11px] font-bold">
                {rec.label}
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 font-main leading-relaxed">
            {rec.reason}
          </p>
        </div>
      </div>

      {/* Right: Metrics Block */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex lg:items-center gap-3 sm:gap-4 lg:gap-6 pt-3 lg:pt-0 border-t border-white/[0.04] lg:border-t-0 text-left lg:text-right flex-shrink-0">
        {/* Ganancia Extra / Día */}
        <div className="bg-[#141416] lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none">
          <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">
            {language === 'es' ? 'Ganancia extra / día' : 'Extra profit / day'}
          </span>
          <div className="font-mono font-black text-sm sm:text-base flex items-baseline lg:justify-end">
            <span className="text-emerald-400">
              +{formatNumber(rec.addedProfitPerDay)}
            </span>
            <span className="text-amber-400 font-bold text-xs ml-1">COIN</span>
          </div>
        </div>

        {/* Costo de Mejora */}
        {rec.upgradeCost !== null && (
          <div className="bg-[#141416] lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">
              {language === 'es' ? 'Costo mejora' : 'Upgrade cost'}
            </span>
            <div className="font-mono font-bold text-xs sm:text-sm text-zinc-200 flex items-center lg:justify-end gap-1.5 mt-0.5">
              <ResourceIcon symbol={rec.nextRow?.upgrade_token || 'COIN'} size={16} />
              <span className="text-amber-300">
                {formatNumber(rec.upgradeCost)}
              </span>
              <span className="text-zinc-400 text-[11px]">
                {rec.nextRow?.upgrade_token || 'COIN'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
