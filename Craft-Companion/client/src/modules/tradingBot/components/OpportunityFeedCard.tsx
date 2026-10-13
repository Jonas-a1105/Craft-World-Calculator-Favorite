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
import { formatCoin } from '../../baseCost/services/baseCostFormatters';
import { RESOURCE_METADATA } from '../../baseCost/data/baseCostCatalog';
import type { TradingOpportunity } from '../types';
import { useTranslation } from '../../../utils/i18n';

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
  const { language } = useTranslation();
  const isEs = language === 'es';

  const getTypeBadge = () => {
    switch (opportunity.type) {
      case 'DIP_BUY':
        return {
          label: isEs ? 'Compra en Caída' : 'Dip Buy',
          sublabel: 'DIP',
          bg: 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent ring-1 ring-emerald-400/25 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)]',
          separator: 'text-emerald-500/60',
          icon: <AltArrowDownLinear size={12} className="shrink-0" />,
        };
      case 'SPIKE_SELL':
        return {
          label: isEs ? 'Techo de Venta' : 'Spike Sell',
          sublabel: 'SPIKE',
          bg: 'bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-transparent ring-1 ring-rose-400/25 text-rose-300 shadow-[0_0_12px_rgba(251,113,133,0.15)]',
          separator: 'text-rose-500/60',
          icon: <AltArrowUpLinear size={12} className="shrink-0" />,
        };
      case 'CRAFT_ARBITRAGE':
        return {
          label: isEs ? 'Arbitraje de Crafteo' : 'Craft Arbitrage',
          sublabel: 'CRAFT',
          bg: 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent ring-1 ring-amber-400/25 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)]',
          separator: 'text-amber-500/60',
          icon: <BoltBoldDuotone size={12} className="shrink-0" />,
        };
      case 'WATCHLIST_HIT':
        return {
          label: isEs ? 'Alerta Watchlist' : 'Watchlist Alert',
          sublabel: 'WATCH',
          bg: 'bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent ring-1 ring-sky-400/25 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.15)]',
          separator: 'text-sky-500/60',
          icon: <CheckCircleBold size={12} className="shrink-0" />,
        };
    }
  };

  const getTierBadge = () => {
    switch (opportunity.tier) {
      case 'S':
        return 'bg-gradient-to-br from-amber-400/25 to-amber-600/15 text-amber-300 ring-1 ring-amber-400/40 font-bold shadow-[0_0_10px_rgba(251,191,36,0.2)]';
      case 'A':
        return 'bg-gradient-to-br from-cyan-400/25 to-cyan-600/15 text-cyan-300 ring-1 ring-cyan-400/40 font-semibold shadow-[0_0_10px_rgba(34,211,238,0.15)]';
      case 'B':
        return 'bg-gradient-to-br from-zinc-600/40 to-zinc-800/40 text-zinc-300 ring-1 ring-zinc-500/30 font-medium';
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
          label: '#1',
          title: 'Top 1 · Mejor señal',
          fill: '#EF4444', // rojo sólido del diseño original
          icon: <CrownBold size={12} className="shrink-0" />,
        };
      case 2:
        return {
          label: '#2',
          title: 'Top 2',
          fill: '#F97316', // naranja sólido del diseño original
          icon: <FireBold size={12} className="shrink-0" />,
        };
      case 3:
        return {
          label: '#3',
          title: 'Top 3',
          fill: '#F59E0B', // ámbar sólido del diseño original
          icon: <StarBold size={12} className="shrink-0" />,
        };
      default:
        return null;
    }
  };

  const rankConfig = getRankConfig();

  return (
    <div className="flex flex-col justify-between rounded-[28px] sm:rounded-[32px] bg-oled-card hover:bg-oled-pillHover p-4 sm:p-5 shadow-md transition-all duration-200 group border-none select-none relative overflow-hidden">
      {/* Top rank paint-splash band (Top 3) — pincelada sólida que cubre la parte superior */}
      {rankConfig && (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none select-none">
          <svg
            width="100%"
            height="30"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            className="drop-shadow-md"
          >
            {/* Pincelada: borde superior recto, borde inferior con onda de pintura suave */}
            <path
              d="M 0 0 L 100 0 L 100 4 C 88 8, 76 5, 64 9 C 52 13, 44 19, 34 21 C 24 23, 15 19, 8 23 C 4 25, 2 27, 0 30 Z"
              fill={rankConfig.fill}
            />
          </svg>
          <div className="absolute top-1 left-3 flex items-center gap-1.5 text-white font-black text-[11px] font-sans tracking-wider" title={rankConfig.title}>
            {rankConfig.icon}
            <span className="leading-none">{rankConfig.label}</span>
          </div>
        </div>
      )}

      <div>
        {/* Top Header: Resource Logo, Name, Tier & Score */}
        <div
          className={`flex items-center justify-between gap-3 border-b border-white/5 pb-2.5 ${
            rankConfig ? 'pt-6 sm:pt-7' : ''
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
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider ${getTierBadge()}`}
                >
                  Tier {opportunity.tier}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide backdrop-blur-sm [clip-path:polygon(7px_0,100%_0,100%_100%,7px_100%,0_50%)] ${badge.bg}`}
                >
                  <span className="flex items-center justify-center">
                    {badge.icon}
                  </span>
                  {badge.label}
                  <span className={`font-mono text-[11px] opacity-60 ${badge.separator}`}>
                    /{badge.sublabel}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Opportunity Score Pill */}
          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-oled-cardInner shadow-inner font-mono">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Score</span>
              <span className="text-xs font-bold text-amber-400">
                {opportunity.score}
              </span>
              <span className="text-[11px] text-slate-400">/100</span>
            </div>
          </div>
        </div>

        {/* Financial Metrics Strip: Identical format to BaseCost */}
        <div className="grid grid-cols-3 items-center gap-2 mt-3.5 p-3 rounded-2xl bg-oled-cardInner shadow-inner font-mono text-xs">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-tight">{isEs ? 'Precio actual' : 'Current price'}</div>
            <div className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5 tabular-nums">
              <span>{formatCoin(opportunity.currentPrice)}</span>
              <ResourceIcon symbol="COIN" size={12} />
            </div>
          </div>

          <div className="text-center">
            <div className="text-[11px] text-slate-400 uppercase tracking-tight">
              {opportunity.type === 'CRAFT_ARBITRAGE'
                ? isEs ? 'Margen neto' : 'Net margin'
                : isEs ? 'Descuento' : 'Discount'}
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
            <div className="text-[11px] text-slate-400 uppercase tracking-tight">{isEs ? 'Ganancia lote' : 'Batch profit'}</div>
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
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-1.5 font-mono uppercase">
              <BoxBold size={12} className="text-amber-400" />
              {isEs ? 'Insumos requeridos:' : 'Required ingredients:'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.ingredients.map((ing) => (
                <span
                  key={ing.symbol}
                  className="px-2 py-0.5 rounded-xl bg-oled-cardInner text-slate-300 text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-sm"
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
          className="flex-1 py-2 px-3 rounded-2xl bg-oled-cardInner hover:bg-zinc-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border-none shadow-sm cursor-pointer hover:shadow active:scale-98"
        >
          <CalculatorBoldDuotone size={15} className="text-amber-400" />
          <span>{isEs ? 'Simular Inversión' : 'Simulate Investment'}</span>
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

