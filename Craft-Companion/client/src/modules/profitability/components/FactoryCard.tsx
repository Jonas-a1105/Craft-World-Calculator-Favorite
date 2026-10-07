import React from 'react';
import type { FactorySummary } from '../types';
import { useTranslation } from '../../../utils/i18n';
import { formatCompactNumber } from '../../../utils/formatters';
import { FactoryIcon } from '../../../components/GameIcon';

export interface FactoryCardProps {
  summary: FactorySummary;
  onSelect: (token: string) => void;
}

export const FactoryCard: React.FC<FactoryCardProps> = ({ summary, onSelect }) => {
  const { language } = useTranslation();
  const isOwned = summary.ownedLevel !== null;
  const isLoss = summary.cycle.effectiveProfitPerDay < 0;

  return (
    <div
      onClick={() => onSelect(summary.token)}
      className="bg-[#18181b] hover:bg-[#1f1f25] rounded-[32px] p-6 shadow-xl flex flex-col justify-between gap-5 transition-colors duration-200 cursor-pointer group select-none"
    >
      {/* Top Header: Avatar + Title/Subtitle + Bookmark Action */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with status dot */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-black/60 ring-2 ring-white/10 flex items-center justify-center flex-shrink-0">
            <FactoryIcon symbol={summary.token} size={34} />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#18181b] ${
                isOwned ? 'bg-emerald-400' : 'bg-zinc-600'
              }`}
            />
          </div>

          {/* Title & Subtitle */}
          <div className="min-w-0">
            <h3 className="font-bold text-white text-base tracking-wide truncate">
              {summary.token}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {isOwned
                ? language === 'es'
                  ? `Nv. ${summary.ownedLevel} • En propiedad`
                  : `Lv. ${summary.ownedLevel} • Owned`
                : language === 'es'
                  ? 'Fábrica Base • Nv. 1'
                  : 'Base Factory • Lv. 1'}
            </p>
          </div>
        </div>

        {/* Bookmark Action Pill Icon */}
        <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-zinc-300 transition-colors flex-shrink-0">
          <svg
            className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </div>

      {/* Description Paragraph */}
      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 min-h-[34px]">
        {summary.cycle.rawBaseMaterialsText
          ? language === 'es'
            ? `Requiere insumos: ${summary.cycle.rawBaseMaterialsText}. Genera ${summary.cycle.runsPerHour.toFixed(1)} ciclos/h.`
            : `Inputs: ${summary.cycle.rawBaseMaterialsText}. Runs ${summary.cycle.runsPerHour.toFixed(1)} cycles/h.`
          : language === 'es'
            ? `Extracción directa de ${summary.token}. Ciclo continuo de ${summary.cycle.runsPerHour.toFixed(1)} ejecuciones por hora.`
            : `Direct extraction of ${summary.token}. Produces continuously at ${summary.cycle.runsPerHour.toFixed(1)} cycles/h.`}
      </p>

      {/* Stats 4 Columns with Thin Vertical Dividers */}
      <div className="grid grid-cols-4 divide-x divide-white/10 pt-1 text-center">
        <div className="px-1">
          <span
            className={`block font-bold text-xs sm:text-sm truncate ${
              isLoss ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {summary.cycle.effectiveProfitPerHour > 0 ? '+' : ''}
            {formatCompactNumber(summary.cycle.effectiveProfitPerHour)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
            {language === 'es' ? 'Ganancia/h' : 'Profit/h'}
          </span>
        </div>

        <div className="px-1">
          <span
            className={`block font-bold text-xs sm:text-sm truncate ${
              isLoss ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {summary.cycle.effectiveProfitPerDay > 0 ? '+' : ''}
            {formatCompactNumber(summary.cycle.effectiveProfitPerDay)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
            {language === 'es' ? 'Ganancia/día' : 'Profit/day'}
          </span>
        </div>

        <div className="px-1">
          <span className="block font-bold text-xs sm:text-sm text-amber-400 truncate">
            {formatCompactNumber(summary.cycle.xpPerHour)}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
            {language === 'es' ? 'XP/h' : 'XP/h'}
          </span>
        </div>

        <div className="px-1">
          <span
            className={`block font-bold text-xs sm:text-sm truncate ${
              typeof summary.cycle.marginPercent === 'number' &&
              summary.cycle.marginPercent < 0
                ? 'text-rose-400'
                : 'text-cyan-400'
            }`}
          >
            {typeof summary.cycle.marginPercent === 'number'
              ? `${summary.cycle.marginPercent > 0 ? '+' : ''}${summary.cycle.marginPercent.toFixed(0)}%`
              : '100%'}
          </span>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
            {language === 'es' ? 'Margen' : 'Margin'}
          </span>
        </div>
      </div>

      {/* Bottom Full-Width Pill Button */}
      <button
        type="button"
        className="w-full h-12 rounded-full !bg-white hover:!bg-zinc-200 !text-black hover:!text-black font-semibold text-xs sm:text-sm normal-case tracking-normal transition-colors duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>
          {language === 'es' ? 'Ver los 40 niveles' : 'Inspect levels 1-40'}
        </span>
      </button>
    </div>
  );
};
