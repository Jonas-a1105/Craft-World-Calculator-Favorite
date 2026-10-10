import React from 'react';
import { useTranslation } from '../../../utils/i18n';
import { FactoryIcon } from '../../../components/GameIcon';
import type { FactoryTableRow, BoostOption } from '../types';
import { formatNumber } from '../../../utils/formatters';

interface ProfitabilityMobileCardProps {
  row: FactoryTableRow;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenModal: () => void;

  onIncrementCount: () => void;
  onDecrementCount: () => void;
  onSetMaxLevel: () => void;
  onIncrementMastery: () => void;
  onDecrementMastery: () => void;
  onSetBoost: (boost: BoostOption) => void;
}

export const ProfitabilityMobileCard: React.FC<ProfitabilityMobileCardProps> = ({
  row,
  isFavorite,
  onToggleFavorite,
  onOpenModal,
  onIncrementCount,
  onDecrementCount,
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
    <div className="w-full bg-[#18181b] rounded-[32px] p-5 shadow-xl space-y-4 select-none">
      {/* Card Header: Avatar + Token + Star + Price + 24h Change */}
      <div className="flex items-center justify-between gap-3">
        <div
          onClick={onOpenModal}
          className="flex items-center gap-3 cursor-pointer min-w-0"
        >
          <div className="relative w-11 h-11 rounded-full bg-black/60 flex items-center justify-center flex-shrink-0">
            <FactoryIcon symbol={row.token} size={28} />
            {isActive && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#18181b]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base tracking-wide truncate">
                {row.token}
              </h3>
              {row.isModified && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                  title="Simulación modificada"
                />
              )}
            </div>
            <p className="text-[11px] text-zinc-500 capitalize truncate">
              {row.category}
            </p>
          </div>
        </div>

        {/* Price & Favorite Action */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-white tabular-nums">
              {formatNumber(row.priceCoin, row.priceCoin < 1 ? 4 : 2)} COIN
            </div>
            <div
              className={`text-[10px] font-semibold tabular-nums ${
                row.change24h > 0
                  ? 'text-emerald-400'
                  : row.change24h < 0
                    ? 'text-rose-400'
                    : 'text-zinc-500'
              }`}
            >
              {row.change24h > 0 ? '▲ ' : row.change24h < 0 ? '▼ ' : ''}
              {Math.abs(row.change24h).toFixed(2)}%
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleFavorite}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-zinc-800 text-zinc-500 hover:text-white'
            }`}
          >
            ★
          </button>
        </div>
      </div>

      {/* Controls Grid: # Factories, Level, Mastery, Boost */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* # Factories Stepper */}
        <div className="bg-zinc-800/60 p-2.5 rounded-2xl flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400">
            {isEs ? '# Fábricas' : '# Factories'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDecrementCount}
              disabled={row.count <= 0}
              className="w-6 h-6 rounded-full bg-zinc-700/80 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black flex items-center justify-center"
            >
              -
            </button>
            <span className="w-5 text-center font-black text-white text-xs tabular-nums">
              {row.count}
            </span>
            <button
              type="button"
              onClick={onIncrementCount}
              className="w-6 h-6 rounded-full bg-zinc-700/80 hover:bg-zinc-600 text-white text-xs font-black flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Level Selector with Max Button */}
        <div className="bg-zinc-800/60 p-2.5 rounded-2xl flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400">
            {isEs ? 'Nivel' : 'Level'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-white text-xs tabular-nums">
              {row.level}/{row.maxLevel}
            </span>
            <button
              type="button"
              onClick={onSetMaxLevel}
              className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-colors ${
                row.level >= row.maxLevel
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              M
            </button>
          </div>
        </div>

        {/* Mastery Stepper */}
        <div className="bg-zinc-800/60 p-2.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block">
              {isEs ? 'Maestría' : 'Mastery'}
            </span>
            {row.masteryReductionPercent > 0 && (
              <span className="text-[9px] text-emerald-400 font-bold block">
                +{row.masteryReductionPercent.toFixed(2)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDecrementMastery}
              disabled={row.masteryLevel <= 0}
              className="w-6 h-6 rounded-full bg-zinc-700/80 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black flex items-center justify-center"
            >
              -
            </button>
            <span className="w-4 text-center font-black text-white text-xs tabular-nums">
              {row.masteryLevel}
            </span>
            <button
              type="button"
              onClick={onIncrementMastery}
              disabled={row.masteryLevel >= 10}
              className="w-6 h-6 rounded-full bg-zinc-700/80 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Booster Selector */}
        <div className="bg-zinc-800/60 p-2.5 rounded-2xl flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400">
            Boost
          </span>
          <select
            value={row.boost}
            onChange={(e) => onSetBoost(e.target.value as BoostOption)}
            className="bg-zinc-700 text-white text-xs font-bold rounded-full px-2.5 py-1 outline-none border-none cursor-pointer"
          >
            <option value="None">None</option>
            <option value="x2">x2</option>
          </select>
        </div>
      </div>

      {/* Card Footer: Power & Net Profit Summary */}
      <div className="bg-black/30 p-3 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
            {isEs ? 'Consumo de Energía' : 'Power Consumption'}
          </span>
          <span className="text-xs font-bold text-zinc-300 tabular-nums">
            {isActive ? `${formatNumber(row.powerKwPerHour, 1)} kW/h` : '-'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
            {isEs ? 'Ganancia / Hora' : 'Profit / Hour'}
          </span>
          {isActive ? (
            <div className="inline-flex items-center gap-1">
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full tabular-nums ${
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
              <span className="text-amber-400 text-xs">🪙</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-zinc-600">-</span>
          )}
        </div>
      </div>
    </div>
  );
};
