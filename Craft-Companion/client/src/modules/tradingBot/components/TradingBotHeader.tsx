import React from 'react';
import {
  BellBingBoldDuotone,
  ChatDotsBoldDuotone,
  RefreshLinear,
  Chart2BoldDuotone,
  CheckCircleBold,
  BoltBoldDuotone,
} from 'solar-icon-set';
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
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-[#141416] p-6 sm:p-7 rounded-[32px] border-none shadow-2xl relative overflow-hidden">
        {/* Ambient background glows: orange & blue */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-3.5">
            <span className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/20 shrink-0">
              <BoltBoldDuotone size={26} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-game font-impostor text-white tracking-wider uppercase">
                  Trading Bot & Radar
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border-none shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live 24/7
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1 max-w-xl">
                Detección inteligente de caídas (Dip Buys), techos de venta (Spike Sells) y arbitraje de crafteo con tarifas netas descontadas.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {/* Watchlist Manager button */}
          <button
            type="button"
            onClick={onOpenWatchlist}
            className="px-4 py-2 rounded-2xl bg-[#1c1c20] hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 border-none shadow-md cursor-pointer"
          >
            <BellBingBoldDuotone size={16} className="text-amber-400" />
            <span>Mis Alertas</span>
            {watchlistCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Discord Webhook trigger */}
          <button
            type="button"
            onClick={onOpenDiscord}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border-none shadow-md cursor-pointer ${
              discordAlertsEnabled
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/20'
                : 'bg-[#1c1c20] text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ChatDotsBoldDuotone size={16} className={discordAlertsEnabled ? 'text-white' : 'text-blue-400'} />
            <span>Discord Webhook</span>
            {discordAlertsEnabled && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Manual Refresh Scan */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isScanning}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 disabled:opacity-50 cursor-pointer border-none"
          >
            <RefreshLinear size={15} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Escaneando...' : 'Escanear'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid: No uppercase labels, natural readable styling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Active Opportunities */}
        <div className="bg-[#141416] p-5 rounded-[32px] border-none shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              Oportunidades activas
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Chart2BoldDuotone size={17} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.activeOpportunities}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              detectadas
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Filtro de señales en tiempo real
          </div>
        </div>

        {/* KPI 2: Top Profit Margin */}
        <div className="bg-[#141416] p-5 rounded-[32px] border-none shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              Mayor margen neto
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircleBold size={17} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              +{stats.topProfitPercent}%
            </span>
            <span className="text-xs font-medium text-zinc-400">
              neto
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Deducido 5% fee de marketplace
          </div>
        </div>

        {/* KPI 3: Batch Yield */}
        <div className="bg-[#141416] p-5 rounded-[32px] border-none shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              Rendimiento por lote
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <BoltBoldDuotone size={17} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.estimated24hYieldCoin.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-400">
              COIN
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            Retorno por ciclo estándar
          </div>
        </div>

        {/* KPI 4: Bot Engine Status */}
        <div className="bg-[#141416] p-5 rounded-[32px] border-none shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              Estado del radar
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isScanning ? 'Sincronizando' : 'Monitoreando'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">
            Libro de órdenes y pools OK
          </div>
        </div>
      </div>
    </div>
  );
};
