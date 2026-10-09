import React from 'react';
import { useTranslation } from '../../../utils/i18n';
import { formatNumber, formatCompact } from '../../../utils/formatters';
import type { PoolResourceItem } from '../../../services/roninPoolsService';
import type { Timeframe } from '../types';

interface Props {
  symbol: string;
  poolItem: PoolResourceItem | null;
  activeTimeframe: Timeframe;
}

export const ResourceMarketStatsCard: React.FC<Props> = ({
  symbol,
  poolItem,
  activeTimeframe,
}) => {
  const { language } = useTranslation();

  if (!poolItem) return null;

  const isLongTerm = activeTimeframe === '1W' || activeTimeframe === '1M' || activeTimeframe === 'MAX';
  const periodStats =
    activeTimeframe === '1W'
      ? poolItem.price7d
      : activeTimeframe === '1M' || activeTimeframe === 'MAX'
        ? poolItem.price30d
        : poolItem.price1d;

  const periodLabel =
    activeTimeframe === '1W'
      ? (language === 'es' ? '7 Días' : '7 Days')
      : activeTimeframe === '1M' || activeTimeframe === 'MAX'
        ? (language === 'es' ? '30 Días' : '30 Days')
        : (language === 'es' ? '24 Horas' : '24 Hours');

  const formatPrice = (v: number) => {
    if (v === 0) return '—';
    if (v < 0.01) return formatNumber(v, 5);
    if (v >= 1000) return formatCompact(v);
    return formatNumber(v, 2);
  };

  const statItems = [
    {
      label: language === 'es' ? `Máximo (${periodLabel})` : `High (${periodLabel})`,
      sub: 'ATH Katana',
      value: formatPrice(periodStats.ath),
      textColor: 'text-emerald-400',
      icon: (
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
    },
    {
      label: language === 'es' ? `Mínimo (${periodLabel})` : `Low (${periodLabel})`,
      sub: 'ATL Katana',
      value: formatPrice(periodStats.atl),
      textColor: 'text-rose-400',
      icon: (
        <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
    },
    {
      label: language === 'es' ? 'Mediana de Mercado' : 'Market Median',
      sub: language === 'es' ? 'Filtrado de spikes' : 'Robust center',
      value: formatPrice(periodStats.median),
      textColor: 'text-amber-400',
      icon: (
        <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
    },
    {
      label: language === 'es' ? 'Promedio Ponderado' : 'Weighted Average',
      sub: language === 'es' ? 'Media del período' : 'Period mean',
      value: formatPrice(periodStats.average),
      textColor: 'text-sky-300',
      icon: (
        <svg className="w-3.5 h-3.5 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      label: language === 'es' ? 'Liquidez en Pool' : 'Pool Liquidity',
      sub: 'Katana DEX (TVL)',
      value: poolItem.liquidity.average > 0 ? `${formatCompact(poolItem.liquidity.average)} u` : '—',
      textColor: 'text-purple-300',
      icon: (
        <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-[#16171b] rounded-[22px] p-4 sm:p-5 shadow-xl border-none space-y-3.5 select-none w-full">
      {/* Header */}
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-zinc-200 font-semibold text-[13px] tracking-wide uppercase font-sans">
            {language === 'es' ? 'Métricas de Mercado (Ronin Katana DEX)' : 'Market Analytics (Ronin Katana DEX)'}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-md bg-[#1e1f25] text-zinc-400 text-[11px] font-mono font-medium border-none">
          {symbol}
        </span>
      </div>

      {/* Grid of 5 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 text-xs font-mono">
        {statItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#121316] rounded-xl p-3 flex flex-col justify-between border-none transition-colors hover:bg-[#18191e]"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10px] text-zinc-400 font-sans font-medium truncate" title={item.label}>
                {item.label}
              </span>
              {item.icon}
            </div>

            <div className={`text-base sm:text-lg font-extrabold ${item.textColor} tracking-tight leading-tight`}>
              {item.value}
            </div>

            <span className="text-[9px] text-zinc-500 font-sans mt-1">
              {item.sub}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
