import React, { useState } from 'react';
import {
  AltArrowUpLinear,
  AltArrowDownLinear,
  CalculatorBoldDuotone,
  Plain2BoldDuotone,
  CheckCircleBold,
  BoltBoldDuotone,
  BoxBold,
} from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import type { TradingOpportunity } from '../types';

interface OpportunityFeedCardProps {
  opportunity: TradingOpportunity;
  onSimulate: (opp: TradingOpportunity) => void;
  onSendDiscord: (opp: TradingOpportunity) => Promise<{ success: boolean; message: string }>;
}

export const OpportunityFeedCard: React.FC<OpportunityFeedCardProps> = ({
  opportunity,
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
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold shadow-sm';
      case 'A':
        return 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-sm';
      case 'B':
        return 'bg-[#27272a] text-zinc-300 font-semibold';
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

  return (
    <div className="bg-[#141416] hover:bg-[#18181c] transition-all duration-300 rounded-[32px] p-5 sm:p-6 border-none shadow-xl flex flex-col justify-between group relative overflow-hidden">
      {/* Subtle warm glow on Tier S */}
      {opportunity.tier === 'S' && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div>
        {/* Top Header: Resource Logo & Game Font Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Resource Icon Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-[#1c1c20] flex items-center justify-center p-2 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <ResourceIcon
                symbol={opportunity.symbol}
                size={32}
                className="w-8 h-8 object-contain drop-shadow"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-game font-impostor text-white tracking-wider uppercase">
                  {opportunity.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase ${getTierBadge()}`}
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
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1c1c20] shadow-sm">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Score</span>
              <span className="text-xs font-black text-amber-400">
                {opportunity.score}
              </span>
              <span className="text-[10px] text-zinc-500 font-semibold">/100</span>
            </div>
          </div>
        </div>

        {/* Financial Metrics Strip: Natural text casing, no aggressive uppercase */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl bg-[#18181c] shadow-inner">
          <div>
            <div className="text-[11px] text-zinc-400 font-medium">Precio actual</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {opportunity.currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{' '}
              <span className="text-[10px] text-amber-400 font-normal">COIN</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-zinc-400 font-medium">
              {opportunity.type === 'CRAFT_ARBITRAGE' ? 'Margen neto' : 'Descuento'}
            </div>
            <div
              className={`text-xs font-bold mt-0.5 ${
                opportunity.potentialMarginPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {opportunity.potentialMarginPercent >= 0 ? '+' : ''}
              {opportunity.potentialMarginPercent}%
            </div>
          </div>

          <div>
            <div className="text-[11px] text-zinc-400 font-medium">Ganancia por lote</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">
              +{opportunity.potentialProfitCoin.toLocaleString()}{' '}
              <span className="text-[10px] text-zinc-400 font-normal">COIN</span>
            </div>
          </div>
        </div>

        {/* Tactical Recommendation */}
        <div className="mt-3 space-y-1">
          <p className="text-xs text-zinc-300 font-normal leading-relaxed">
            {opportunity.reason}
          </p>
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="line-clamp-1">{opportunity.actionRecommendation}</span>
          </div>
        </div>

        {/* Ingredients preview for Craft Arbitrage */}
        {opportunity.ingredients && opportunity.ingredients.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-zinc-800/60">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold mb-1.5">
              <BoxBold size={12} className="text-amber-400" />
              Insumos requeridos:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.ingredients.map((ing) => (
                <span
                  key={ing.symbol}
                  className="px-2 py-0.5 rounded-xl bg-[#1c1c20] text-zinc-300 text-[10px] font-medium flex items-center gap-1.5 shadow-sm"
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
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center gap-2">
        {/* Simulate button */}
        <button
          type="button"
          onClick={() => onSimulate(opportunity)}
          className="flex-1 py-2 px-3 rounded-2xl bg-[#1c1c20] hover:bg-zinc-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border-none shadow-md cursor-pointer hover:shadow-lg active:scale-98"
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
          className="py-2 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border-none shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 active:scale-98"
        >
          <Plain2BoldDuotone size={13} className={isSendingDiscord ? 'animate-pulse' : ''} />
          <span>{discordFeedback || (isSendingDiscord ? 'Enviando...' : 'Discord')}</span>
        </button>
      </div>
    </div>
  );
};
