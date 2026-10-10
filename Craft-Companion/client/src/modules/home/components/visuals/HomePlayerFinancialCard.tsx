import React, { useState } from 'react';
import type { CraftworldProfile, CraftWorldData, CraftData, PurchasesData } from '../../types';
import { formatNumber, formatCompactNumber } from '../../../../utils/formatters';
import {
  Buildings2BoldDuotone,
  BoltBoldDuotone,
  ScaleBoldDuotone,
  CupStarBoldDuotone,
  WalletBoldDuotone,
  CheckCircleBold,
  EyeBold,
  EyeClosedBold,
  LightbulbBoldDuotone,
  AltArrowRightBold,
} from 'solar-icon-set';

export interface HomePlayerFinancialCardProps {
  profile?: CraftworldProfile;
  craftWorld?: CraftWorldData;
  craft?: CraftData;
  purchases?: PurchasesData;
  language: string;
}

export const HomePlayerFinancialCard: React.FC<HomePlayerFinancialCardProps> = ({
  profile,
  craftWorld,
  craft,
  purchases,
  language,
}) => {
  const isEs = language === 'es';
  const [activeCategory, setActiveCategory] = useState<string>('factories');
  const [isBalanceMasked, setIsBalanceMasked] = useState<boolean>(false);
  const [insightIdx, setInsightIdx] = useState<number>(0);

  // Approximate balance in COIN based on profile or fallback
  const estimatedBalance = (craftWorld?.resources?.length || 1) * 24500 + 92038;

  // 4 Actionable Insights for Craft World (from mockup)
  const insightsList = [
    {
      tagEs: 'producción',
      tagEn: 'production',
      titleEs: 'Optimización de Fábricas',
      titleEn: 'Factory Optimization',
      textEs: '¡Has administrado tus ciclos de producción con alta eficiencia! Considera reasignar trabajadores a tus fábricas de Nivel 25+ para maximizar el margen de beneficio por hora.',
      textEn: 'You have managed your production loops with high efficiency! Consider reallocating workers to your Level 25+ factories to maximize hourly margin.',
    },
    {
      tagEs: 'insumos',
      tagEn: 'inputs',
      titleEs: 'Arbitraje de Recursos',
      titleEn: 'Resource Arbitrage',
      textEs: 'El costo de adquirir Arcilla en el mercado bajó un 14% esta semana. Resulta más rentable comprar insumos directamente que pausar la mina de barro para convertirlos.',
      textEn: 'The market cost of acquiring Clay dropped by 14% this week. It is more profitable to buy inputs directly than pausing your mud mine to refine them.',
    },
    {
      tagEs: 'pases',
      tagEn: 'passes',
      titleEs: 'Estado de Bonificaciones',
      titleEn: 'Perks Status',
      textEs: 'Detectamos que tus multiplicadores de cuenta están activos y cubren holgadamente las demandas energéticas de la base. Tus minas operan con velocidad máxima.',
      textEn: 'We detected that your account perks are active and comfortably cover base energy requirements. Your mines are running at peak speed.',
    },
    {
      tagEs: 'rentabilidad',
      tagEn: 'profitability',
      titleEs: 'Meta Semanal de COIN',
      titleEn: 'Weekly COIN Target',
      textEs: 'Meta semanal: Has acumulado el +24% del beneficio proyectado. Mantén este patrón de producción continua para asegurar la liga de Masterpiece.',
      textEn: 'Weekly goal: You have accumulated +24% of projected profit. Maintain this continuous loop to secure your Masterpiece league tier.',
    },
  ];

  const currentInsight = insightsList[insightIdx] || insightsList[0];

  const nextInsight = () => {
    setInsightIdx((prev) => (prev + 1) % insightsList.length);
  };

  return (
    <div className="w-full bg-[#18181b] rounded-[34px] p-5 sm:p-7 shadow-2xl relative overflow-hidden select-none border-none space-y-6">
      {/* Ambient Radial Depth Glows */}
      <div className="absolute -top-36 -left-36 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-36 w-96 h-96 bg-fuchsia-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Category Circle Badges with Magenta Glow Rings (from mockup) */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 pt-1 relative z-10 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategory('factories')}
          className={`category-ring ${activeCategory === 'factories' ? 'active' : ''} w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#141416] text-white shrink-0 cursor-pointer border-none shadow-sm transition-transform hover:scale-105`}
          title={isEs ? 'Fábricas' : 'Factories'}
        >
          <Buildings2BoldDuotone className="w-5 h-5 text-fuchsia-300" />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('mines')}
          className={`category-ring ${activeCategory === 'mines' ? 'active' : ''} w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#141416] text-white shrink-0 cursor-pointer border-none shadow-sm transition-transform hover:scale-105`}
          title={isEs ? 'Minas & Energía' : 'Mines & Power'}
        >
          <BoltBoldDuotone className="w-5 h-5 text-fuchsia-300" />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('market')}
          className={`category-ring ${activeCategory === 'market' ? 'active' : ''} w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#141416] text-white shrink-0 cursor-pointer border-none shadow-sm transition-transform hover:scale-105`}
          title={isEs ? 'Mercado & Comercio' : 'Market & Trade'}
        >
          <ScaleBoldDuotone className="w-5 h-5 text-fuchsia-300" />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('passes')}
          className={`category-ring ${activeCategory === 'passes' ? 'active' : ''} w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#141416] text-white shrink-0 cursor-pointer border-none shadow-sm transition-transform hover:scale-105`}
          title={isEs ? 'Pases & Masterpiece' : 'Passes & League'}
        >
          <CupStarBoldDuotone className="w-5 h-5 text-fuchsia-300" />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('wallet')}
          className={`category-ring ${activeCategory === 'wallet' ? 'active' : ''} w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#141416] text-white shrink-0 cursor-pointer border-none shadow-sm transition-transform hover:scale-105`}
          title={isEs ? 'Billetera Ronin' : 'Ronin Wallet'}
        >
          <WalletBoldDuotone className="w-5 h-5 text-fuchsia-300" />
        </button>
      </div>

      {/* 2. Middle Row: Dusk Mountain Virtual Card + Intelligent Insights Card (from mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch relative z-10">
        
        {/* Virtual Debit / Player Identity Card (Dusk Mountain Aesthetic) */}
        <div
          onClick={() => setIsBalanceMasked(!isBalanceMasked)}
          className="credit-card-dusk card-tilt rounded-[26px] p-5 sm:p-6 text-white flex flex-col justify-between h-[214px] sm:h-[228px] shadow-xl border border-white/10 relative cursor-pointer group"
          title={isEs ? 'Haz clic para ocultar o mostrar saldo' : 'Click to toggle balance visibility'}
        >
          {/* Card Glass Shimmer Layer */}
          <div className="absolute inset-0 card-shimmer" />

          {/* Stylized Moon & Mountain Silhouette SVG inside the card */}
          <svg className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-45 mix-blend-screen" viewBox="0 0 350 200" preserveAspectRatio="none" fill="none">
            {/* Glowing Moon */}
            <circle cx="115" cy="65" r="13" fill="#ffe9c4" filter="drop-shadow(0 0 8px #fcd34d)" />
            {/* Distant Mountains */}
            <path d="M0 130 L45 95 L95 125 L160 80 L220 125 L290 85 L350 120 L350 200 L0 200 Z" fill="#2d1d36" />
            {/* Foreground Ridges */}
            <path d="M0 150 L60 120 L130 145 L190 115 L260 145 L320 125 L350 140 L350 200 L0 200 Z" fill="#171220" />
          </svg>

          {/* Top row: EMV Chip & Balance Mask Pill */}
          <div className="relative z-10 flex items-center justify-between">
            {/* Golden EMV Chip with micro-tracks */}
            <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-200/90 to-amber-100 border border-amber-300/40 p-1 flex flex-col justify-between shadow-inner">
              <div className="w-full h-[1.5px] bg-amber-800/40" />
              <div className="w-full flex justify-between">
                <div className="w-2.5 h-2 bg-amber-800/40 rounded-sm" />
                <div className="w-2.5 h-2 bg-amber-800/40 rounded-sm" />
              </div>
              <div className="w-full h-[1.5px] bg-amber-800/40" />
            </div>

            {/* Frosted Glass Mask Icon */}
            <div className="w-9 h-6 rounded-full bg-white/20 backdrop-blur-md p-1 flex items-center justify-center border border-white/30 shadow-sm text-white transition-all">
              {isBalanceMasked ? <EyeClosedBold className="w-3.5 h-3.5" /> : <EyeBold className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Center: Masked UID / Account Serial */}
          <div className="relative z-10 my-auto pt-2">
            <div className="tracking-[0.24em] text-white/95 text-xs sm:text-sm font-mono font-bold drop-shadow-md">
              •••• •••• •••• {profile?.level ? `LV${profile.level}` : '200'}
            </div>
          </div>

          {/* Bottom: Cardholder Name & Balance */}
          <div className="relative z-10 flex items-end justify-between text-xs tracking-wider">
            <div>
              <div className="text-[9px] font-semibold text-white/60 uppercase tracking-widest">
                {isEs ? 'Titular Craftworld' : 'Craftworld Holder'}
              </div>
              <div className="font-bold text-white text-xs sm:text-[13px] tracking-wide mt-0.5 drop-shadow-sm uppercase truncate max-w-[150px]">
                {profile?.displayName || 'Alfikri Djati'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-semibold text-white/60 uppercase tracking-widest">
                {isEs ? 'Saldo disponible' : 'Available Balance'}
              </div>
              <div className="font-black text-white text-sm sm:text-base font-mono tracking-tight mt-0.5 drop-shadow-sm">
                {isBalanceMasked ? '•••••••• COIN' : `${formatNumber(estimatedBalance)} COIN`}
              </div>
            </div>
          </div>
        </div>

        {/* Intelligent Insights Recommendation Card (from mockup) */}
        <div className="bg-[#141416] rounded-[26px] p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden border-none space-y-3">
          <div>
            {/* Header with Bulb Icon */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-300">
                <LightbulbBoldDuotone className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                {isEs ? 'Análisis Inteligente' : 'Smart Analytics'}
              </h3>
            </div>

            {/* Dynamic Insight Subtitle & Body */}
            <span className="text-xs font-bold text-fuchsia-400 block mb-1">
              {isEs ? currentInsight.titleEs : currentInsight.titleEn}
            </span>
            <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-300 transition-opacity duration-300">
              {isEs ? currentInsight.textEs : currentInsight.textEn}
            </p>
          </div>

          {/* Carousel / Segmented Progress Bar (4 segments from mockup) */}
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 cursor-pointer" onClick={nextInsight}>
              {insightsList.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i === insightIdx ? 'bg-white' : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 font-medium">
              <span>{isEs ? `Paso ${insightIdx + 1} de 4` : `Step ${insightIdx + 1} of 4`}</span>
              <button
                type="button"
                onClick={nextInsight}
                className="text-fuchsia-400 hover:text-fuchsia-300 cursor-pointer font-bold flex items-center gap-1 border-none bg-transparent"
              >
                <span>{isEs ? 'Siguiente análisis' : 'Next insight'}</span>
                <AltArrowRightBold className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Section: Suscripciones y Pases Activos (6 cards from mockup) */}
      <div className="relative z-10 pt-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
            {isEs ? 'Pases y Servicios de Cuenta' : 'Passes & Account Services'}
          </h4>
          <span className="text-xs text-zinc-500 font-mono">
            {purchases?.crystalPass?.hasActivePass ? (isEs ? 'Pass Activo' : 'Active Pass') : (isEs ? 'Base 1x' : 'Base 1x')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Crystal Pass */}
          <div className="bg-zinc-800/40 rounded-2xl p-3.5 flex items-center justify-between border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <CupStarBoldDuotone className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Crystal Pass</h5>
                <p className="text-[10px] text-zinc-400">{isEs ? 'Pase de Temporada' : 'Season Pass'}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full font-mono">
              {purchases?.crystalPass?.hasActivePass ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Card 2: Boost de Fábricas (2x) */}
          <div className="bg-zinc-800/40 rounded-2xl p-3.5 flex items-center justify-between border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <BoltBoldDuotone className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Booster 2x</h5>
                <p className="text-[10px] text-zinc-400">{isEs ? 'Velocidad de Producción' : 'Production Speed'}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-mono">
              2x Boost
            </span>
          </div>

          {/* Card 3: Sin Anuncios (No Ads) */}
          <div className="bg-zinc-800/40 rounded-2xl p-3.5 flex items-center justify-between border-none shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircleBold className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">No-Ads Perk</h5>
                <p className="text-[10px] text-zinc-400">{isEs ? 'Multiplicador Permanente' : 'Permanent Multiplier'}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-mono">
              +5% Bonus
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
