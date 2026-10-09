import React from 'react';
import { MagniferLinear, BoltLinear } from 'solar-icon-set';

interface EfficiencySectionProps {
  search: string;
  onSearchChange: (search: string) => void;
  powerPricePer100k: number;
  onPowerPriceChange: (price: number) => void;
  globalMultiplier: number;
  onGlobalMultiplierChange: (multiplier: number) => void;
  language: string;
  baseSymbol: string;
}

export const EfficiencySection: React.FC<EfficiencySectionProps> = ({
  search,
  onSearchChange,
  powerPricePer100k,
  onPowerPriceChange,
  globalMultiplier,
  onGlobalMultiplierChange,
  language,
  baseSymbol,
}) => {
  const isEs = language === 'es';

  return (
    <div className="w-full space-y-3 pt-3">
      {/* Title & Multiplier Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              {isEs ? 'Eficiencia en Vivo' : 'Live Efficiency'}
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold">
              Crowns per COIN
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {isEs
              ? 'Eficiencia = Coronas Totales / Costo Total (Tokens + Power)'
              : 'Efficiency = Total Crowns / Total Cost (Tokens + Power)'}
          </p>
        </div>

        {/* Global Multiplier Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-slate-400 mr-1">
            {isEs ? 'Tramo:' : 'Bracket:'}
          </span>
          {[1, 2, 4, 8].map((mult) => (
            <button
              key={mult}
              type="button"
              onClick={() => onGlobalMultiplierChange(mult)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border-none ${
                globalMultiplier === mult
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#22222a] text-slate-300 hover:text-white hover:bg-[#2c2c36]'
              }`}
            >
              {mult}x
            </button>
          ))}
        </div>
      </div>

      {/* Search Input & Power Price Input - clearly distinguished on canvas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <MagniferLinear size={18} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isEs
                ? 'Buscar recurso (ej. Hydrogen, Oil, Acid)...'
                : 'Search resource (e.g. Hydrogen, Oil, Acid)...'
            }
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#1c1c22] text-xs font-sans text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all border-none shadow-lg shadow-black/25"
          />
        </div>

        {/* Power Price Input Setting */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#1c1c22] shrink-0 border-none shadow-lg shadow-black/25">
          <div className="text-amber-400">
            <BoltLinear size={18} />
          </div>
          <span className="text-xs font-mono text-slate-300 whitespace-nowrap font-medium">
            {isEs ? 'Precio Power:' : 'Power price:'}
          </span>
          <input
            type="number"
            step="0.5"
            min="0"
            value={powerPricePer100k}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onPowerPriceChange(isNaN(val) ? 0 : val);
            }}
            className="w-16 px-2 py-0.5 rounded-lg bg-[#131316] text-right font-mono text-xs font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50 border-none shadow-inner"
          />
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap font-medium">
            {baseSymbol} / 100k
          </span>
        </div>
      </div>
    </div>
  );
};
