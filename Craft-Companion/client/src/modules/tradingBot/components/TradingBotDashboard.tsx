import React from 'react';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import {
  MagniferLinear,
  BoltBoldDuotone,
  AltArrowDownLinear,
  AltArrowUpLinear,
  BellBingBoldDuotone,
  TuningBoldDuotone,
} from 'solar-icon-set';
import { useTradingBot } from '../hooks/useTradingBot';
import { TradingBotHeader } from './TradingBotHeader';
import { OpportunityFeedCard } from './OpportunityFeedCard';
import { ArbitrageCalculatorModal } from './ArbitrageCalculatorModal';
import { DiscordWebhookModal } from './DiscordWebhookModal';
import { WatchlistManagerModal } from './WatchlistManagerModal';
import type { OpportunityFilter } from '../types';

export const TradingBotDashboard: React.FC = () => {
  const {
    loading,
    opportunities,
    rawOpportunities,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    watchlist,
    config,
    isScanning,
    selectedOpportunity,
    isCalculatorModalOpen,
    setIsCalculatorModalOpen,
    isDiscordModalOpen,
    setIsDiscordModalOpen,
    isWatchlistModalOpen,
    setIsWatchlistModalOpen,
    webhookStatus,
    triggerScan,
    handleAddWatchlistRule,
    handleDeleteWatchlistRule,
    handleToggleWatchlistRule,
    handleSaveConfig,
    handleTestDiscord,
    handleSendOpportunityToDiscord,
    openCalculator,
  } = useTradingBot();

  if (loading) {
    return <SkeletonDashboardPage />;
  }

  const filterTabs: { id: OpportunityFilter; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'ALL',
      label: 'Todas',
      icon: <TuningBoldDuotone size={14} />,
      count: rawOpportunities.length,
    },
    {
      id: 'CRAFT_ARBITRAGE',
      label: 'Arbitraje Crafteo',
      icon: <BoltBoldDuotone size={14} />,
      count: rawOpportunities.filter((o) => o.type === 'CRAFT_ARBITRAGE').length,
    },
    {
      id: 'DIP_BUY',
      label: 'Compras en Caída',
      icon: <AltArrowDownLinear size={14} />,
      count: rawOpportunities.filter((o) => o.type === 'DIP_BUY').length,
    },
    {
      id: 'SPIKE_SELL',
      label: 'Techos de Venta',
      icon: <AltArrowUpLinear size={14} />,
      count: rawOpportunities.filter((o) => o.type === 'SPIKE_SELL').length,
    },
    {
      id: 'WATCHLIST_HIT',
      label: 'Mis Alertas',
      icon: <BellBingBoldDuotone size={14} />,
      count: rawOpportunities.filter((o) => o.type === 'WATCHLIST_HIT').length,
    },
  ];

  return (
    <div className="w-full max-w-[1240px] mx-auto space-y-5 pb-24 select-none px-2 sm:px-4">
      {/* Header and KPI summary */}
      <TradingBotHeader
        stats={stats}
        isScanning={isScanning}
        onRefresh={triggerScan}
        onOpenDiscord={() => setIsDiscordModalOpen(true)}
        onOpenWatchlist={() => setIsWatchlistModalOpen(true)}
        discordAlertsEnabled={config.discordAlertsEnabled && Boolean(config.discordWebhookUrl)}
        watchlistCount={watchlist.filter((w) => w.enabled).length}
      />

      {/* Control Topbar: Compact, sleek and 100% responsive */}
      <div className="bg-[#141416] p-3 sm:p-4 rounded-[28px] sm:rounded-[32px] border-none shadow-xl space-y-3 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-4">
        {/* Filter Category Tabs: Horizontal scroll on mobile, flex on desktop */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth shrink-0">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border-none cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-md shadow-orange-500/20 active:scale-95'
                    : 'bg-[#1c1c20] text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls: Compact & Responsive */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 lg:w-56">
            <MagniferLinear
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar recurso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c1c20] border-none rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 shadow-inner font-medium"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1c1c20] border-none rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50 shadow-inner cursor-pointer shrink-0"
          >
            <option value="SCORE">Mayor Score</option>
            <option value="MARGIN">Mayor Margen %</option>
            <option value="PRICE">Menor Precio</option>
          </select>
        </div>
      </div>

      {/* Opportunities Feed Grid */}
      {opportunities.length === 0 ? (
        <div className="bg-[#141416] border-none rounded-[32px] p-10 text-center space-y-3.5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#1c1c20] text-zinc-500 flex items-center justify-center mx-auto">
            <MagniferLinear size={24} />
          </div>
          <h3 className="text-base font-bold text-white">
            No se encontraron oportunidades con los filtros seleccionados
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Intenta cambiar de pestaña, reducir el umbral de score en la configuración o borrar el término de búsqueda.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer border-none"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {opportunities.map((opp) => (
            <OpportunityFeedCard
              key={opp.id}
              opportunity={opp}
              onSimulate={openCalculator}
              onSendDiscord={handleSendOpportunityToDiscord}
            />
          ))}
        </div>
      )}

      {/* Interactive Arbitrage Simulator Modal */}
      <ArbitrageCalculatorModal
        opportunity={selectedOpportunity}
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
      />

      {/* Discord Webhook Modal */}
      <DiscordWebhookModal
        config={config}
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
        onSaveConfig={handleSaveConfig}
        onTestWebhook={handleTestDiscord}
        webhookStatus={webhookStatus}
      />

      {/* Watchlist Manager Modal */}
      <WatchlistManagerModal
        watchlist={watchlist}
        isOpen={isWatchlistModalOpen}
        onClose={() => setIsWatchlistModalOpen(false)}
        onAddRule={handleAddWatchlistRule}
        onDeleteRule={handleDeleteWatchlistRule}
        onToggleRule={handleToggleWatchlistRule}
      />
    </div>
  );
};
