import React from 'react';
import type { ExchangeData } from '../../types';
import Card from '../../../../components/Card';
import { useTranslation } from '../../../../utils/i18n';
import { formatNumber } from '../../../../utils/formatters';
import { displayNumber } from '../../utils/formatters';
import { ResourceIcon } from '../../../../components/GameIcon';
import { EmptyState } from '../EmptyState';
import { ScopeUnauthorizedCard } from '../ScopeUnauthorizedCard';
import {
  Chart2BoldDuotone,
  RefreshBoldDuotone,
  BoltBoldDuotone,
  ChartSquareBoldDuotone,
  ArchiveBoldDuotone,
  History2BoldDuotone,
} from 'solar-icon-set';

export interface ExchangeTabProps {
  exchange?: ExchangeData;
  onReauthorize: () => void;
}

export const ExchangeTab: React.FC<ExchangeTabProps> = ({ exchange, onReauthorize }) => {
  const { language } = useTranslation();

  if (!exchange) {
    return <ScopeUnauthorizedCard scope="exchange:read" onReauthorize={onReauthorize} />;
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 items-start">
        {/* Card 1: Estadísticas del Mercado */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <Chart2BoldDuotone className="w-5 h-5 text-emerald-400" />
              <span>{language === 'es' ? 'Estadísticas del Mercado' : 'Market Stats'}</span>
            </span>
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#202024] hover:bg-[#28282e] rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center gap-1.5">
                <RefreshBoldDuotone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                  {language === 'es' ? 'Operaciones' : 'Trades'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-2">
                {displayNumber(exchange.tradeAccount?.tradeCount ?? 0)}
              </div>
            </div>

            <div className="bg-[#202024] hover:bg-[#28282e] rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center gap-1.5">
                <BoltBoldDuotone className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                  {language === 'es' ? 'Recarga Diaria' : 'Daily Refill'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-2">
                {displayNumber(exchange.tradeAccount?.dailyRefillAmount ?? 0)}
              </div>
            </div>

            <div className="bg-[#202024] hover:bg-[#28282e] rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center gap-1.5">
                <ChartSquareBoldDuotone className="w-4 h-4 text-cyan-400" />
                <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                  {language === 'es' ? 'Volumen Total' : 'Total Volume'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400 mt-2 truncate">
                {formatNumber(exchange.tradeAccount?.totalTradeAmount)}
              </div>
            </div>

            <div className="bg-[#202024] hover:bg-[#28282e] rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
              <div className="flex items-center gap-1.5">
                <ArchiveBoldDuotone className="w-4 h-4 text-purple-400" />
                <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                  {language === 'es' ? 'Capacidad' : 'Capacity'}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-purple-400 mt-2">
                {displayNumber(exchange.tradeAccount?.capacity ?? 0)}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Historial de Ejecuciones */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <History2BoldDuotone className="w-5 h-5 text-indigo-400" />
              <span>{language === 'es' ? 'Historial de Ejecuciones' : 'Trade History'}</span>
            </span>
          }
          action={
            exchange.tradeExecutions?.length ? (
              <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-full">
                {exchange.tradeExecutions.length} {language === 'es' ? 'trades' : 'trades'}
              </span>
            ) : undefined
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          {exchange.tradeExecutions?.length ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              {exchange.tradeExecutions.map((t, i) => {
                const inRaw = Number(t.quote?.input?.amount);
                const outRaw = Number(t.quote?.output?.amount);
                const inAmount = !isNaN(inRaw) ? formatNumber(inRaw) : (t.quote?.input?.amount ?? '0');
                const outAmount = !isNaN(outRaw) ? formatNumber(outRaw) : (t.quote?.output?.amount ?? '0');

                return (
                  <div
                    key={t.id || i}
                    className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 text-xs flex justify-between items-center transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-2">
                      <div className="flex items-center gap-1 shrink-0">
                        <ResourceIcon symbol={t.quote?.input?.symbol || ''} size={18} />
                        <span className="text-slate-200 font-bold font-mono">{inAmount}</span>
                        <span className="text-slate-400 text-[11px] hidden sm:inline">
                          {t.quote?.input?.symbol}
                        </span>
                      </div>

                      <span className="text-slate-500 font-bold px-0.5">➔</span>

                      <div className="flex items-center gap-1 shrink-0">
                        <ResourceIcon symbol={t.quote?.output?.symbol || ''} size={18} />
                        <span className="text-emerald-400 font-black font-mono">{outAmount}</span>
                        <span className="text-emerald-500/80 text-[11px] hidden sm:inline">
                          {t.quote?.output?.symbol}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                      {t.id ? `${t.id.slice(0, 8)}...` : 'tx'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState>
              {language === 'es' ? 'No hay operaciones recientes' : 'No recent trades'}
            </EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
};
