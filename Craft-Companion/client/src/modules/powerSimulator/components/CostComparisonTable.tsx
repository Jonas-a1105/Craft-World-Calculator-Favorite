import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatCoin } from '../services/powerCalculatorService';
import type { CostComparisonRow } from '../types';

interface CostComparisonTableProps {
  rows: CostComparisonRow[];
  coinUsdPrice: number | null;
  language: string;
}

export const CostComparisonTable: React.FC<CostComparisonTableProps> = ({
  rows,
  coinUsdPrice,
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="space-y-3 select-none">
      {/* Title */}
      <div>
        <h2 className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase">
          {isEs ? 'COMPARATIVA DE COSTOS' : 'COST COMPARISON'}
        </h2>
        <p className="text-xs font-mono text-slate-500 mt-0.5">
          {isEs
            ? 'Todos los métodos normalizados a COIN / 100k Power — ordenados de más barato a más caro.'
            : 'All methods normalized to COIN / 100k Power — sorted cheapest first.'}
        </p>
      </div>

      {/* Desktop Column Header (subtle guides) */}
      <div className="hidden lg:grid grid-cols-12 px-6 py-1 text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
        <div className="col-span-4">{isEs ? 'MÉTODO' : 'METHOD'}</div>
        <div className="col-span-2 text-right">{isEs ? 'PERIODO' : 'PERIOD'}</div>
        <div className="col-span-2 text-right">{isEs ? 'ENERGÍA' : 'POWER'}</div>
        <div className="col-span-2 text-right">{isEs ? 'COSTO CRISTAL' : 'CRYSTAL COST'}</div>
        <div className="col-span-2 text-right">{isEs ? 'COIN / 100K' : 'COIN / 100K'}</div>
      </div>

      {/* Elongated Horizontal Cards List */}
      <div className="space-y-2.5">
        {rows.map((row, idx) => {
          const isCheapest = row.isCheapest;
          return (
            <div
              key={idx}
              className={`p-4 sm:px-6 sm:py-4 rounded-3xl transition-all border-none outline-none ${
                isCheapest
                  ? 'bg-[#15231c] ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/30'
                  : 'bg-[#1c1c22] hover:bg-[#22222a] shadow-md shadow-black/25'
              }`}
            >
              {/* Desktop layout (>= lg) */}
              <div className="hidden lg:grid grid-cols-12 items-center font-mono text-xs">
                {/* METHOD */}
                <div className="col-span-4 flex items-center gap-2 min-w-0 pr-2">
                  {isCheapest && (
                    <span className="text-emerald-400 font-bold text-sm shrink-0">★</span>
                  )}
                  <span
                    className={`font-bold truncate ${
                      isCheapest ? 'text-emerald-300 font-black' : 'text-white'
                    }`}
                  >
                    {row.label}
                  </span>
                </div>

                {/* PERIOD */}
                <div className="col-span-2 text-right text-slate-400 text-[11px] truncate">
                  {row.periodText}
                </div>

                {/* POWER */}
                <div className="col-span-2 text-right font-black text-[#38BDF8]">
                  {row.powerText}
                </div>

                {/* CRYSTAL COST */}
                <div className="col-span-2 text-right">
                  <div className="inline-flex items-center gap-1.5 justify-end">
                    <span className="text-indigo-300 font-bold">{row.crystals} 🍃</span>
                    {row.crystalEquivalentCoin !== null && (
                      <div className="flex items-center gap-0.5 text-[11px] text-slate-400">
                        <span>≈ {formatCoin(row.crystalEquivalentCoin)}</span>
                        <ResourceIcon symbol="COIN" size={11} />
                      </div>
                    )}
                  </div>
                </div>

                {/* COIN / 100K */}
                <div className="col-span-2 text-right">
                  <div className="flex flex-col items-end">
                    <span
                      className="font-black text-sm sm:text-base leading-tight"
                      style={{ color: row.colorHsl || '#4ade80' }}
                    >
                      {formatCoin(row.coinPer100k)}
                    </span>
                    {row.crystalEquivalentCoin !== null && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {formatCoin(row.crystalEquivalentCoin)} total
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile / Tablet layout (< lg) */}
              <div className="lg:hidden flex flex-col gap-2.5 font-mono">
                {/* Top row: Method Name & Star on left, COIN/100K on right */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isCheapest && (
                      <span className="text-emerald-400 font-bold text-sm shrink-0">★</span>
                    )}
                    <span
                      className={`text-xs font-bold truncate ${
                        isCheapest ? 'text-emerald-300 font-black' : 'text-white'
                      }`}
                    >
                      {row.label}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className="font-black text-sm block"
                      style={{ color: row.colorHsl || '#4ade80' }}
                    >
                      {formatCoin(row.coinPer100k)}
                    </span>
                    <span className="text-[9px] text-slate-400 block -mt-0.5">
                      COIN / 100k
                    </span>
                  </div>
                </div>

                {/* Bottom row pills: Power, Period, Crystals */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-white/5 text-[11px]">
                  <div className="px-2.5 py-1 rounded-xl bg-[#131316] text-[#38BDF8] font-bold shadow-inner">
                    ⚡ {row.powerText}
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-[#131316] text-slate-300 shadow-inner">
                    {row.periodText}
                  </div>
                  {row.crystalEquivalentCoin !== null && (
                    <div className="px-2.5 py-1 rounded-xl bg-[#131316] text-slate-300 shadow-inner flex items-center gap-1">
                      <span>≈ {formatCoin(row.crystalEquivalentCoin)}</span>
                      <ResourceIcon symbol="COIN" size={11} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {coinUsdPrice === null && (
        <div className="p-4 rounded-2xl bg-[#17171d] text-center text-xs font-mono text-slate-500 shadow-inner">
          {isEs
            ? 'Cargando cotización de mercado de COIN para calcular comparativas exactas...'
            : 'Loading live COIN market price to calculate exact comparisons...'}
        </div>
      )}
    </div>
  );
};
