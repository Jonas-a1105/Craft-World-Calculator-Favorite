import React from 'react';
import { FlameBold } from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import type { EfficiencyItem } from '../types';

import { PowerBracketSteppedBar } from './PowerBracketSteppedBar';

interface EfficiencyCardProps {
  item: EfficiencyItem;
  onMultiplierChange: (symbol: string, mult: number) => void;
  onUnitsChange?: (symbol: string, units: number) => void;
  onBracketChange?: (symbol: string, bracketIdx: number) => void;
  baseSymbol: string;
  language: string;
}

function formatValue(val: number, isCurrency = false): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(2)}k`;
  }
  return isCurrency ? val.toFixed(2) : val.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export const EfficiencyCard: React.FC<EfficiencyCardProps> = ({
  item,
  onMultiplierChange,
  onUnitsChange,
  onBracketChange,
  baseSymbol,
  language,
}) => {
  const isEs = language === 'es';
  const isTopRank = item.rank <= 3;
  const isGoodRank = item.rank <= 8;
  const units = item.units || 1;

  const cycleMultiplier = () => {
    const next =
      item.multiplier === 1
        ? 2
        : item.multiplier === 2
          ? 4
          : item.multiplier === 4
            ? 8
            : 1;
    onMultiplierChange(item.symbol, next);
  };

  return (
    <div
      className={`p-4 rounded-3xl bg-[#1c1c22] hover:bg-[#23232b] transition-all shadow-xl shadow-black/25 space-y-3.5 border-none outline-none select-none relative ${
        isTopRank ? 'pt-5' : ''
      }`}
    >
      {/* Etiqueta / Badge lleno amarillo COIN con efecto de racha en la esquina superior izquierda */}
      {isTopRank && (
        <div className="absolute -top-2.5 left-4 z-10 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] font-mono shadow-md shadow-amber-500/35 overflow-hidden select-none">
          {/* Efecto de rayo / barrido de racha */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-streak-shine pointer-events-none" />
          <FlameBold size={13} className="text-amber-950 shrink-0 animate-pulse" />
          <span className="tracking-tight">#{item.rank}</span>
        </div>
      )}

      {/* Top Header: Rank, Resource Icon & Name, Efficiency Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#131316] flex items-center justify-center shrink-0 shadow-inner">
              <ResourceIcon symbol={item.symbol} size={24} />
            </div>
            {!isTopRank && (
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shadow-md bg-[#131316] text-slate-300 ring-1 ring-white/10">
                {item.rank}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
              {item.name}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 truncate uppercase">
              {item.symbol}
            </p>
          </div>
        </div>

        {/* Primary Crowns / COIN Pill */}
        <div className="flex flex-col items-end shrink-0">
          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
              isTopRank
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : isGoodRank
                  ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-[#131316] text-slate-200'
            }`}
          >
            {formatValue(item.efficiency)}{' '}
            <span className="text-[10px] font-normal opacity-80">cr/COIN</span>
          </span>
        </div>
      </div>

      {/* Desired Quantity Stepper / Input */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-[#131316]">
        <span className="text-[10.5px] font-mono font-medium text-slate-400">
          {isEs ? 'Cantidad deseada:' : 'Desired quantity:'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onUnitsChange?.(item.symbol, Math.max(1, units - 1))}
            disabled={units <= 1}
            className="w-5 h-5 rounded-lg bg-[#202028] hover:bg-[#2b2b36] disabled:opacity-30 disabled:hover:bg-[#202028] text-slate-200 font-bold text-xs flex items-center justify-center transition-colors border-none"
            title={isEs ? 'Restar 1 unidad' : 'Subtract 1 unit'}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={units}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              onUnitsChange?.(item.symbol, Number.isNaN(parsed) || parsed < 1 ? 1 : parsed);
            }}
            className="w-12 text-center text-xs font-mono font-bold bg-[#1a1a20] text-amber-300 rounded-lg py-0.5 border-none outline-none focus:ring-1 focus:ring-amber-400/50"
          />
          <button
            type="button"
            onClick={() => onUnitsChange?.(item.symbol, units + 1)}
            className="w-5 h-5 rounded-lg bg-[#202028] hover:bg-[#2b2b36] text-slate-200 font-bold text-xs flex items-center justify-center transition-colors border-none"
            title={isEs ? 'Sumar 1 unidad' : 'Add 1 unit'}
          >
            +
          </button>
          <span className="text-[10px] font-mono text-slate-400 ml-0.5">
            {isEs ? 'uds' : 'units'}
          </span>
        </div>
      </div>

      {/* Stepped Power Escalation Bar ("tipo gráfica") */}
      {item.powerBrackets && item.powerBrackets.length > 0 && (
        <PowerBracketSteppedBar
          brackets={item.powerBrackets}
          selectedIndex={item.bracketIndex}
          multiplier={item.multiplier}
          onSelectIndex={(idx) => onBracketChange?.(item.symbol, idx)}
          language={language}
        />
      )}

      {/* Metrics 2x2 Grid inside the card */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-xs font-mono">
        {/* Crowns */}
        <div className="p-2.5 rounded-2xl bg-[#131316] space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isEs ? 'Coronas Totales' : 'Total Crowns'}
            </span>
            {units > 1 && (
              <span className="text-[9px] text-slate-400">
                ×{units}
              </span>
            )}
          </div>
          <span className="text-white font-bold">
            {formatValue(item.totalCrowns)}
          </span>
        </div>

        {/* Power + Multiplier */}
        <div className="p-2.5 rounded-2xl bg-[#131316] space-y-0.5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 block font-medium">
                {isEs ? 'Power Total' : 'Total Power'}
              </span>
              {units > 1 && (
                <span className="text-[9px] text-slate-400">
                  ×{units}
                </span>
              )}
            </div>
            <span className="text-white font-bold">
              {formatValue(item.totalPower)}
            </span>
          </div>
          <button
            type="button"
            onClick={cycleMultiplier}
            title="Cambiar tramo (1x, 2x, 4x, 8x)"
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors border-none ${
              item.multiplier > 1
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-[#26262e] text-slate-300 hover:text-white hover:bg-[#32323e]'
            }`}
          >
            {item.multiplier}x
          </button>
        </div>

        {/* Market Price */}
        <div className="p-2.5 rounded-2xl bg-[#131316] space-y-0.5">
          <span className="text-[10px] text-slate-400 block font-medium">
            {isEs ? 'Precio Mercado' : 'Market Price'}
          </span>
          <span className="text-slate-200 font-bold">
            {formatValue(item.marketPrice, true)}{' '}
            <span className="text-[9px] text-slate-400 font-normal">{baseSymbol}</span>
          </span>
        </div>

        {/* Total Cost */}
        <div className="p-2.5 rounded-2xl bg-[#131316] space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isEs ? 'Costo Total' : 'Total Cost'}
            </span>
            {units > 1 && (
              <span className="text-[9px] text-slate-400">
                ×{units}
              </span>
            )}
          </div>
          <span className="text-slate-200 font-bold">
            {formatValue(item.totalCost, true)}{' '}
            <span className="text-[9px] text-slate-400 font-normal">{baseSymbol}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
