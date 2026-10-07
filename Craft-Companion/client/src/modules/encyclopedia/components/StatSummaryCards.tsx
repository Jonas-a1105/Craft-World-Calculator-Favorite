import React from 'react';
import { SummaryStats } from '../types';
import { formatCompact, formatDuration } from '../utils/formatters';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  stats: SummaryStats;
}

export const StatSummaryCards: React.FC<Props> = ({ stats }) => {
  const { language } = useTranslation();

  const cards = [
    {
      label: language === 'es' ? 'NIVELES' : 'LEVELS',
      value: stats.maxLevel.toString(),
      color: 'text-white',
    },
    {
      label: language === 'es' ? 'PROD / DÍA AL MÁX' : 'PROD / DAY AT MAX',
      value: formatCompact(stats.prodPerDayAtMax),
      color: 'text-emerald-400',
    },
    {
      label: language === 'es' ? 'PODER AL MÁX' : 'POWER AT MAX',
      value: stats.powerAtMax.toString(),
      color: 'text-amber-400',
    },
    {
      label: language === 'es' ? 'CICLO AL MÁX' : 'CYCLE AT MAX',
      value: formatDuration(stats.cycleDurationAtMaxSeconds),
      color: 'text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5 w-full min-w-0 max-w-full">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-[#18181c] rounded-[22px] sm:rounded-[28px] p-3 sm:p-4.5 flex flex-col justify-between shadow-xl border-none transition-transform hover:-translate-y-0.5 duration-150 min-w-0 overflow-hidden"
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 select-none truncate">
            {card.label}
          </span>
          <span className={`text-lg sm:text-2xl font-bold font-main mt-1.5 sm:mt-2 truncate ${card.color}`}>
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
};
