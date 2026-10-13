import React from 'react';
import {
  BellBingBoldDuotone,
  ChatDotsBoldDuotone,
  RefreshLinear,
  Chart2BoldDuotone,
  CheckCircleBold,
  BoltBoldDuotone,
} from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import { MetricCard } from '../../../components/ui/primitives';
import { useTranslation } from '../../../utils/i18n';
import type { TradingBotStats } from '../types';

interface TradingBotHeaderProps {
  stats: TradingBotStats;
  isScanning: boolean;
  onRefresh: () => void;
  onOpenDiscord: () => void;
  onOpenWatchlist: () => void;
  discordAlertsEnabled: boolean;
  watchlistCount: number;
}

export const TradingBotHeader: React.FC<TradingBotHeaderProps> = ({
  stats,
  isScanning,
  onRefresh,
  onOpenDiscord,
  onOpenWatchlist,
  discordAlertsEnabled,
  watchlistCount,
}) => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Compact Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-oled-card p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] border-none shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-3">
            <span className="p-2 sm:p-2.5 rounded-xl bg-amber-500 text-black shadow-sm shrink-0">
              <BoltBoldDuotone size={20} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-sans text-white tracking-tight">
                  Trading Bot & Radar
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border-none shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isEs ? 'En vivo 24/7' : 'Live 24/7'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal mt-0.5 max-w-xl leading-relaxed">
                {isEs
                  ? 'Detección inteligente de caídas (Dip Buys), techos de venta (Spike Sells) y arbitraje de crafteo con tarifas netas descontadas.'
                  : 'Smart detection of dips (Dip Buys), sell spikes (Spike Sells) and craft arbitrage with net fees discounted.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          {/* Watchlist Manager button */}
          <button
            type="button"
            onClick={onOpenWatchlist}
            className="px-3.5 py-1.5 rounded-xl bg-oled-850 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
          >
            <BellBingBoldDuotone size={15} className="text-amber-400" />
            <span>{isEs ? 'Mis Alertas' : 'My Watchlist'}</span>
            {watchlistCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Discord Webhook trigger */}
          <button
            type="button"
            onClick={onOpenDiscord}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border-none shadow-sm cursor-pointer ${
              discordAlertsEnabled
                ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
                : 'bg-oled-850 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ChatDotsBoldDuotone size={15} className={discordAlertsEnabled ? 'text-white' : 'text-blue-400'} />
            <span>Discord Webhook</span>
            {discordAlertsEnabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Manual Refresh Scan */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer border-none"
          >
            <RefreshLinear size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? (isEs ? 'Escaneando...' : 'Scanning...') : (isEs ? 'Escanear' : 'Scan')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid: primitiva compartida MetricCard (LP1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: Active Opportunities */}
        <MetricCard
          variant="kpi"
          icon={<Chart2BoldDuotone className="w-4 h-4 text-amber-400 shrink-0" />}
          label={isEs ? 'Oportunidades activas' : 'Active opportunities'}
          value={stats.activeOpportunities}
          unit={isEs ? 'detectadas' : 'detected'}
          subtitle={isEs ? 'Filtro de señales en tiempo real' : 'Real-time signal filter'}
        />

        {/* KPI 2: Top Profit Margin */}
        <MetricCard
          variant="kpi"
          tone="emerald"
          icon={<CheckCircleBold className="w-4 h-4 text-emerald-400 shrink-0" />}
          label={isEs ? 'Mayor margen neto' : 'Top net margin'}
          value={`+${stats.topProfitPercent}%`}
          unit={isEs ? 'neto' : 'net'}
          subtitle={isEs ? 'Deducido 5% fee de marketplace' : 'After 5% marketplace fee'}
        />

        {/* KPI 3: Batch Yield */}
        <MetricCard
          variant="kpi"
          icon={<BoltBoldDuotone className="w-4 h-4 text-orange-400 shrink-0" />}
          label={isEs ? 'Rendimiento por lote' : 'Batch yield'}
          value={
            <span className="inline-flex items-center gap-1.5">
              {stats.estimated24hYieldCoin.toLocaleString()}
              <ResourceIcon symbol="COIN" size={16} />
            </span>
          }
          subtitle={isEs ? 'Retorno por ciclo estándar' : 'Per standard cycle return'}
        />

        {/* KPI 4: Bot Engine Status */}
        <MetricCard
          variant="kpi"
          icon={<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
          label={isEs ? 'Estado del radar' : 'Radar status'}
          value={isScanning ? (isEs ? 'Escaneando' : 'Scanning') : (isEs ? 'Monitoreando' : 'Monitoring')}
          subtitle={isEs ? 'Libro de órdenes y pools OK' : 'Order book and pools OK'}
        />
      </div>
    </div>
  );
};
