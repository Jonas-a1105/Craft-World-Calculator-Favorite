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
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Compact Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181b] p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] border-none shadow-lg relative overflow-hidden">
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
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border-none shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal mt-0.5 max-w-xl leading-relaxed">
                Detección inteligente de caídas (Dip Buys), techos de venta (Spike Sells) y arbitraje de crafteo con tarifas netas descontadas.
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
            className="px-3.5 py-1.5 rounded-xl bg-[#1c1c20] hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
          >
            <BellBingBoldDuotone size={15} className="text-amber-400" />
            <span>Mis Alertas</span>
            {watchlistCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
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
                : 'bg-[#1c1c20] text-zinc-300 hover:text-white hover:bg-zinc-800'
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
            <span>{isScanning ? 'Escaneando...' : 'Escanear'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid: Identical typography, structure & cards as Inicio (OverviewTab) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* KPI 1: Active Opportunities */}
        <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Chart2BoldDuotone className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
              Oportunidades activas
            </span>
          </div>
          <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                {stats.activeOpportunities}{' '}
                <span className="text-xs font-semibold text-emerald-400 font-sans">detectadas</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                Filtro de señales en tiempo real
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: Top Profit Margin */}
        <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircleBold className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
              Mayor margen neto
            </span>
          </div>
          <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-bold font-sans text-emerald-400 tracking-tight leading-tight truncate">
                +{stats.topProfitPercent}%{' '}
                <span className="text-xs font-medium text-slate-400 font-sans">neto</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                Deducido 5% fee de marketplace
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Batch Yield */}
        <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BoltBoldDuotone className="w-4 h-4 text-orange-400" />
            <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
              Rendimiento por lote
            </span>
          </div>
          <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate flex items-center gap-1.5">
                <span>{stats.estimated24hYieldCoin.toLocaleString()}</span>
                <ResourceIcon symbol="COIN" size={16} />
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
                Retorno por ciclo estándar
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4: Bot Engine Status */}
        <div className="bg-[#18181b] hover:bg-[#1f1f23] rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
                Estado del radar
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-bold font-sans text-white tracking-tight leading-tight truncate">
                {isScanning ? 'Sincronizando' : 'Monitoreando'}
              </div>
              <div className="text-[10px] sm:text-xs text-emerald-400 font-medium mt-0.5 truncate">
                Libro de órdenes y pools OK
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
