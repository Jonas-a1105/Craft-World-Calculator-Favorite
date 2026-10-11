import React, { useState } from 'react';
import {
  AltArrowUpLinear,
  AltArrowDownLinear,
  CalculatorBoldDuotone,
  Plain2BoldDuotone,
  CheckCircleBold,
  BoltBoldDuotone,
  BoxBold,
  CrownBold,
  FireBold,
  StarBold,
} from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatCoin } from '../../baseCost/services/baseCostCalculatorService';
import { RESOURCE_METADATA } from '../../baseCost/data/baseCostCatalog';
import type { TradingOpportunity } from '../types';

interface OpportunityFeedCardProps {
  opportunity: TradingOpportunity;
  rank?: number;
  onSimulate: (opp: TradingOpportunity) => void;
  onSendDiscord: (opp: TradingOpportunity) => Promise<{ success: boolean; message: string }>;
}

export const OpportunityFeedCard: React.FC<OpportunityFeedCardProps> = ({
  opportunity,
  rank,
  onSimulate,
  onSendDiscord,
}) => {
  const [isSendingDiscord, setIsSendingDiscord] = useState(false);
  const [discordFeedback, setDiscordFeedback] = useState<string | null>(null);

  const getTypeBadge = () => {
    switch (opportunity.type) {
      case 'DIP_BUY':
        return {
          label: 'Compra en Caída (Dip)',
          bg: 'bg-emerald-500/15 text-emerald-400',
          icon: <AltArrowDownLinear size={13} className="text-emerald-400" />,
        };
      case 'SPIKE_SELL':
        return {
          label: 'Techo de Venta (Spike)',
          bg: 'bg-rose-500/15 text-rose-400',
          icon: <AltArrowUpLinear size={13} className="text-rose-400" />,
        };
      case 'CRAFT_ARBITRAGE':
        return {
          label: 'Arbitraje de Crafteo',
          bg: 'bg-amber-500/15 text-amber-400',
          icon: <BoltBoldDuotone size={13} className="text-amber-400" />,
        };
      case 'WATCHLIST_HIT':
        return {
          label: 'Alerta de Watchlist',
          bg: 'bg-blue-500/15 text-blue-400',
          icon: <CheckCircleBold size={13} className="text-blue-400" />,
        };
    }
  };

  const getTierBadge = () => {
    switch (opportunity.tier) {
      case 'S':
        return 'bg-amber-500/15 text-amber-300 font-bold';
      case 'A':
        return 'bg-blue-500/15 text-cyan-300 font-semibold';
      case 'B':
        return 'bg-zinc-800 text-zinc-300 font-medium';
    }
  };

  const badge = getTypeBadge();

  const handleDiscordClick = async () => {
    setIsSendingDiscord(true);
    setDiscordFeedback(null);
    try {
      const res = await onSendDiscord(opportunity);
      setDiscordFeedback(res.success ? 'Enviado!' : res.message);
      setTimeout(() => setDiscordFeedback(null), 3000);
    } catch {
      setDiscordFeedback('Error de red');
      setTimeout(() => setDiscordFeedback(null), 3000);
    } finally {
      setIsSendingDiscord(false);
    }
  };

  const displayName =
    RESOURCE_METADATA[opportunity.symbol?.toUpperCase()]?.name ||
    RESOURCE_METADATA[opportunity.name?.toUpperCase()]?.name ||
    (opportunity.name ? opportunity.name.charAt(0).toUpperCase() + opportunity.name.slice(1).toLowerCase() : '');

  const getRankConfig = () => {
    switch (rank) {
      case 1:
        return {
          fill: '#EF4444',
          label: '1',
          icon: <CrownBold size={13} className="text-amber-200 shrink-0" />,
        };
      case 2:
        return {
          fill: '#F97316',
          label: '2',
          icon: <FireBold size={13} className="text-yellow-200 shrink-0" />,
        };
      case 3:
        return {
          fill: '#F59E0B',
          label: '3',
          icon: <StarBold size={13} className="text-amber-100 shrink-0" />,
        };
      default:
        return null;
    }
  };

  const rankConfig = getRankConfig();

  return (
    <div className="flex flex-col justify-between rounded-[28px] sm:rounded-[32px] bg-[#18181c] hover:bg-[#202026] p-4 sm:p-5 shadow-md transition-all duration-200 group border-none select-none relative overflow-hidden">
      {/* Top Left Organic Pronounced Wave Ribbon Badge for Top 3 */}
      {rankConfig && (
        <div className="absolute top-0 left-0 z-20 pointer-events-none select-none">
          <div className="relative">
            <svg
              width="108"
              height="34"
              viewBox="0 0 134 42"
              fill="none"
              className="drop-shadow-sm"
            >
              <path
                d="M 0 0 L 0 30 C 10 35, 24 40, 38 40 C 52 40, 65 24, 76 11 C 85 2, 95 13, 108 14 C 118 15, 126 6, 134 0 Z"
                fill={rankConfig.fill}
              />
            </svg>
            <div className="absolute top-1.5 left-2.5 flex items-center gap-1.5 text-white font-black text-[11px] font-sans">
              {rankConfig.icon}
              <span className="leading-none font-black tracking-wide">{rankConfig.label}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        {/* Top Header: Resource Logo, Name, Tier & Score */}
        <div
          className={`flex items-center justify-between gap-3 border-b border-white/5 pb-2.5 ${
            rankConfig ? 'pt-2 sm:pt-2.5' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Resource Icon Avatar */}
            <ResourceIcon
              symbol={opportunity.symbol}
              size={34}
              className="drop-shadow shrink-0"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold text-slate-100 truncate">
                  {displayName}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-semibold tracking-wider ${getTierBadge()}`}
                >
                  Tier {opportunity.tier}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg}`}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Opportunity Score Pill */}
          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-[#141417] shadow-inner font-mono">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Score</span>
              <span className="text-xs font-bold text-amber-400">
                {opportunity.score}
              </span>
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
          </div>
        </div>

        {/* Financial Metrics Strip: Identical format to BaseCost */}
        <div className="grid grid-cols-3 items-center gap-2 mt-3.5 p-3 rounded-2xl bg-[#141417] shadow-inner font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-tight">Precio actual</div>
            <div className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5 tabular-nums">
              <span>{formatCoin(opportunity.currentPrice)}</span>
              <ResourceIcon symbol="COIN" size={12} />
            </div>
          </div>

          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-tight">
              {opportunity.type === 'CRAFT_ARBITRAGE' ? 'Margen neto' : 'Descuento'}
            </div>
            <div
              className={`font-semibold mt-0.5 tabular-nums ${
                opportunity.potentialMarginPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {opportunity.potentialMarginPercent >= 0 ? '+' : ''}
              {opportunity.potentialMarginPercent}%
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-tight">Ganancia lote</div>
            <div className="font-bold text-emerald-400 flex items-center justify-end gap-1 mt-0.5 tabular-nums">
              <span>+{formatCoin(opportunity.potentialProfitCoin)}</span>
              <ResourceIcon symbol="COIN" size={12} />
            </div>
          </div>
        </div>

        {/* Tactical Recommendation */}
        <div className="mt-3 space-y-1">
          <p className="text-xs text-slate-300 font-normal leading-relaxed">
            {opportunity.reason}
          </p>
          <div className="text-[11px] text-amber-400 font-mono font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="line-clamp-1">{opportunity.actionRecommendation}</span>
          </div>
        </div>

        {/* Ingredients preview for Craft Arbitrage */}
        {opportunity.ingredients && opportunity.ingredients.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-1.5 font-mono uppercase">
              <BoxBold size={12} className="text-amber-400" />
              Insumos requeridos:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.ingredients.map((ing) => (
                <span
                  key={ing.symbol}
                  className="px-2 py-0.5 rounded-xl bg-[#141417] text-slate-300 text-[10px] font-mono font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <ResourceIcon symbol={ing.symbol} size={14} className="w-3.5 h-3.5 object-contain" />
                  <span className="text-amber-400 font-bold">{ing.qtyNeeded}x</span>
                  <span>{ing.symbol}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center gap-2">
        {/* Simulate button */}
        <button
          type="button"
          onClick={() => onSimulate(opportunity)}
          className="flex-1 py-2 px-3 rounded-2xl bg-[#141417] hover:bg-zinc-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border-none shadow-sm cursor-pointer hover:shadow active:scale-98"
        >
          <CalculatorBoldDuotone size={15} className="text-amber-400" />
          <span>Simular Inversión</span>
        </button>

        {/* Discord Alert Dispatch */}
        <button
          type="button"
          onClick={handleDiscordClick}
          disabled={isSendingDiscord}
          title="Notificar a canal de Discord"
          className="py-2 px-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border-none shadow-sm cursor-pointer disabled:opacity-50 active:scale-98"
        >
          <Plain2BoldDuotone size={13} className={isSendingDiscord ? 'animate-pulse' : ''} />
          <span>{discordFeedback || (isSendingDiscord ? 'Enviando...' : 'Discord')}</span>
        </button>
      </div>
    </div>
  );
};

