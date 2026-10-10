import React from 'react';
import { StarBold, UserBoldDuotone } from 'solar-icon-set';
import { useTranslation } from '../../../utils/i18n';
import { FactoryIcon } from '../../../components/GameIcon';
import { ProfitabilityBoostSelector } from './ProfitabilityBoostSelector';
import { ProfitabilityLevelSelector } from './ProfitabilityLevelSelector';
import type { FactoryTableRow, BoostOption } from '../types';
import { formatNumber } from '../../../utils/formatters';

interface ProfitabilityCardProps {
  row: FactoryTableRow;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenModal: () => void;

  onIncrementCount: () => void;
  onDecrementCount: () => void;
  onSetLevel: (level: number) => void;
  onSetMaxLevel: () => void;
  onIncrementMastery: () => void;
  onDecrementMastery: () => void;
  onSetBoost: (boost: BoostOption) => void;
}

export const ProfitabilityCard: React.FC<ProfitabilityCardProps> = ({
  row,
  isFavorite,
  onToggleFavorite,
  onOpenModal,
  onIncrementCount,
  onDecrementCount,
  onSetLevel,
  onSetMaxLevel,
  onIncrementMastery,
  onDecrementMastery,
  onSetBoost,
}) => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const isActive = row.count > 0;
  const isProfitable = row.profitPerHour > 0;
  const isLoss = row.profitPerHour < 0;

  return (
    <div
      className={`w-full bg-[#18181b] hover:bg-[#1c1c20] rounded-[32px] p-5 sm:p-6 shadow-xl flex flex-col justify-between gap-4 transition-all duration-200 border-none select-none ${
        isFavorite ? 'ring-1 ring-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.08)]' : ''
      }`}
    >
      {/* 1. Header: Avatar + Identity + Live Price + Deltas (1h & 24h) + Favorite Star */}
      <div className="flex items-start justify-between gap-3">
        {/* Left Identity: Avatar & Token Title */}
        <div
          onClick={onOpenModal}
          className="flex items-center gap-3 cursor-pointer min-w-0 group"
          title={isEs ? 'Ver desglose completo de niveles y crafteo' : 'View full levels breakdown & crafting chain'}
        >
          <div className="relative w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FactoryIcon symbol={row.token} size={32} />
            {isActive && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#18181b]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-white text-base tracking-wide truncate group-hover:text-amber-400 transition-colors">
                {row.token}
              </h3>
              {row.isModified && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                  title={isEs ? 'Simulación modificada respecto a tu cuenta' : 'Custom simulation modified vs account'}
                />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-medium text-zinc-400 capitalize">
                {row.category}
              </span>
              {row.isOwned && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                  {isEs ? `Nv. ${row.accountLevel}` : `Lv. ${row.accountLevel}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Prices: Price in COIN + Both 1h & 24h Deltas + Star Icon */}
        <div className="flex items-start gap-2.5 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs sm:text-sm font-extrabold text-white tabular-nums flex items-center justify-end gap-1">
              <span>{formatNumber(row.priceCoin, row.priceCoin < 1 ? 5 : 2)}</span>
              <img src="/assets/resources/Coin.png" alt="COIN" className="w-3.5 h-3.5 object-contain inline-block" />
            </div>

            {/* Price Deltas: 1H and 24H (Full fidelity matching reference table!) */}
            <div className="flex items-center justify-end gap-1.5 mt-0.5 text-[10px] sm:text-[11px] font-bold tabular-nums">
              {/* 1h Delta */}
              <span
                className={`px-1 rounded ${
                  row.change1h > 0
                    ? 'text-emerald-400'
                    : row.change1h < 0
                      ? 'text-rose-400'
                      : 'text-zinc-500'
                }`}
                title="Variación en 1 hora"
              >
                1h {row.change1h > 0 ? '▲+' : row.change1h < 0 ? '▼' : ''}
                {row.change1h.toFixed(1)}%
              </span>

              {/* 24h Delta */}
              <span
                className={`px-1 rounded ${
                  row.change24h > 0
                    ? 'text-emerald-400'
                    : row.change24h < 0
                      ? 'text-rose-400'
                      : 'text-zinc-500'
                }`}
                title="Variación en 24 horas"
              >
                24h {row.change24h > 0 ? '▲+' : row.change24h < 0 ? '▼' : ''}
                {row.change24h.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Star Icon Button (Replaced emoji with StarBold icon) */}
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                : 'bg-zinc-800/80 text-zinc-500 hover:text-white hover:bg-zinc-700/80'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <StarBold className={`w-4 h-4 ${isFavorite ? 'text-amber-400' : 'text-zinc-500'}`} />
          </button>
        </div>
      </div>

      {/* 2. Interactive Simulation Controls Grid (2x2) with Custom Popover Windows */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Block 1: # Fábricas Stepper */}
        <div className="bg-zinc-800/50 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            {isEs ? '# Fábricas' : '# Factories'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onDecrementCount}
              disabled={row.count <= 0}
              className="w-6 h-6 rounded-full bg-zinc-700/80 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black flex items-center justify-center transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="w-6 text-center font-black text-white text-xs sm:text-sm tabular-nums">
              {row.count}
            </span>
            <button
              type="button"
              onClick={onIncrementCount}
              className="w-6 h-6 rounded-full bg-zinc-700/80 hover:bg-zinc-600 text-white text-xs font-black flex items-center justify-center transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Block 2: Level Selector with Custom Popover Window & M button */}
        <div className="bg-zinc-800/50 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            {isEs ? 'Nivel' : 'Level'}
          </span>
          <ProfitabilityLevelSelector
            level={row.level}
            maxLevel={row.maxLevel}
            onChange={onSetLevel}
            onMaxLevel={onSetMaxLevel}
          />
        </div>

        {/* Block 3: Mastery Stepper + Reduction % */}
        <div className="bg-zinc-800/50 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              {isEs ? 'Maestría' : 'Mastery'}
            </span>
            {row.masteryReductionPercent > 0 && (
              <span className="text-[10px] text-emerald-400 font-extrabold block">
                +{row.masteryReductionPercent.toFixed(2)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onDecrementMastery}
              disabled={row.masteryLevel <= 0}
              className="w-6 h-6 rounded-full bg-zinc-700/80 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black flex items-center justify-center transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="w-5 text-center font-black text-white text-xs sm:text-sm tabular-nums">
              {row.masteryLevel}
            </span>
            <button
              type="button"
              onClick={onIncrementMastery}
              disabled={row.masteryLevel >= 10}
              className="w-6 h-6 rounded-full bg-zinc-700/80 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black flex items-center justify-center transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Block 4: Boost with Styled Custom Popover Window (No ugly default select!) */}
        <div className="bg-zinc-800/50 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Boost
          </span>
          <ProfitabilityBoostSelector
            boost={row.boost}
            onChange={onSetBoost}
          />
        </div>
      </div>

      {/* 3. Workers % and Workshop % Perks (Full Parity with Table Columns 8 & 9) */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Workers % */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold bg-zinc-800/40 px-3 py-1 rounded-full">
          <UserBoldDuotone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-zinc-400">Workers:</span>
          <span className="text-white font-extrabold tabular-nums">+{row.workerPercent}%</span>
        </div>

        {/* Workshop % */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold bg-zinc-800/40 px-3 py-1 rounded-full">
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[11px] text-zinc-400">Workshop:</span>
          <span className="text-white font-extrabold tabular-nums">+{row.workshopPercent}%</span>
        </div>
      </div>

      {/* 4. Bottom Metrics Container: Power Consumption & Net Hourly Profit */}
      <div className="bg-zinc-800/50 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
            {isEs ? 'Consumo de Energía' : 'Power Consumption'}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-zinc-300 tabular-nums block mt-0.5">
            {isActive ? `${formatNumber(row.powerKwPerHour, 1)} kW/h` : '-'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
            {isEs ? 'Ganancia / Hora' : 'Profit / Hour'}
          </span>
          {isActive ? (
            <div className="inline-flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-full tabular-nums ${
                  isProfitable
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : isLoss
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {isProfitable ? '+' : ''}
                {formatNumber(row.profitPerHour, 2)}
              </span>
              <img src="/assets/resources/Coin.png" alt="COIN" className="w-4 h-4 object-contain inline-block" />
            </div>
          ) : (
            <span className="text-xs font-bold text-zinc-600 block mt-0.5">-</span>
          )}
        </div>
      </div>
    </div>
  );
};
