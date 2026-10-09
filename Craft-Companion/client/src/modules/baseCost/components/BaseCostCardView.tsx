import React from 'react';
import type { BaseCostRowData } from '../types';
import { ResourceIcon } from '../../../components/GameIcon';
import { BaseCostLevelSelector } from './BaseCostLevelSelector';
import { BaseCostMasterySelector } from './BaseCostMasterySelector';
import {
  formatCoin,
  formatQuantity,
  getMarginTextColor,
} from '../services/baseCostCalculatorService';
import { LinkCircleLinear, BatteryChargeBoldDuotone } from 'solar-icon-set';

interface BaseCostCardViewProps {
  rows: BaseCostRowData[];
  onLevelChange: (token: string, level: number) => void;
  onMasteryChange: (token: string, mastery: number) => void;
}

const CATEGORY_STYLES: Record<string, { text: string; bg: string }> = {
  earth: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  water: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  fire: { text: 'text-rose-400', bg: 'bg-rose-500/10' },
  special: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
  keys: { text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  nests: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  wraps: { text: 'text-lime-400', bg: 'bg-lime-500/10' },
  academy: { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  construction: { text: 'text-orange-400', bg: 'bg-orange-500/10' },
};

export const BaseCostCardView: React.FC<BaseCostCardViewProps> = ({
  rows,
  onLevelChange,
  onMasteryChange,
}) => {
  if (rows.length === 0) {
    return (
      <div className="rounded-[28px] sm:rounded-[32px] bg-[#1c1c22] p-12 text-center text-slate-500 font-mono text-xs shadow-xl shadow-black/25">
        No se encontraron recursos que coincidan con los filtros de búsqueda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
      {rows.map((row) => {
        const marginColor = getMarginTextColor(row.marginPct);
        const catStyle = CATEGORY_STYLES[row.category.toLowerCase()] || {
          text: 'text-slate-400',
          bg: 'bg-slate-800/40',
        };

        return (
          <div
            key={row.token}
            className="flex flex-col justify-between rounded-[28px] sm:rounded-[32px] bg-[#1c1c22] p-4 sm:p-5 shadow-xl shadow-black/25 hover:bg-[#212128] transition-all duration-200 group border-none select-none relative hover:z-20 focus-within:z-30"
          >
            {/* Top Bar: Icon, Name, Category & Selectors */}
            <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <ResourceIcon symbol={row.token} size={34} className="drop-shadow shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-slate-100 truncate">
                      {row.name}
                    </span>
                    {row.poolUrl && (
                      <a
                        href={row.poolUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Ver ${row.name} en Defined.fi`}
                        className="text-slate-500 hover:text-amber-400 transition-colors shrink-0"
                      >
                        <LinkCircleLinear size={14} />
                      </a>
                    )}
                  </div>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-semibold tracking-wider ${catStyle.text} ${catStyle.bg}`}
                  >
                    {row.category}
                  </span>
                </div>
              </div>

              {/* Level & Mastery Selectors */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Lvl</span>
                  <BaseCostLevelSelector
                    token={row.token}
                    curLevel={row.curLevel}
                    maxLevel={row.maxLevel}
                    onLevelChange={onLevelChange}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Mast</span>
                  <BaseCostMasterySelector
                    token={row.token}
                    mastery={row.mastery}
                    onMasteryChange={onMasteryChange}
                  />
                </div>
              </div>
            </div>

            {/* Middle: Elemental & Power Requirements */}
            <div className="py-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              {row.earth > 0 && (
                <div
                  className="flex items-center gap-1.5 bg-[#24211a] px-2.5 py-1 rounded-xl text-xs font-mono text-amber-300 shadow-sm"
                  title={`${row.earth.toFixed(4)} Earth`}
                >
                  <ResourceIcon symbol="EARTH" size={15} />
                  <span className="font-bold text-white">{formatQuantity(row.earth)}</span>
                  <span className="text-[10px] text-amber-500/80 uppercase">Earth</span>
                </div>
              )}
              {row.water > 0 && (
                <div
                  className="flex items-center gap-1.5 bg-[#16202c] px-2.5 py-1 rounded-xl text-xs font-mono text-blue-300 shadow-sm"
                  title={`${row.water.toFixed(4)} Water`}
                >
                  <ResourceIcon symbol="WATER" size={15} />
                  <span className="font-bold text-white">{formatQuantity(row.water)}</span>
                  <span className="text-[10px] text-blue-400/80 uppercase">Water</span>
                </div>
              )}
              {row.fire > 0 && (
                <div
                  className="flex items-center gap-1.5 bg-[#2c1a1a] px-2.5 py-1 rounded-xl text-xs font-mono text-rose-300 shadow-sm"
                  title={`${row.fire.toFixed(4)} Fire`}
                >
                  <ResourceIcon symbol="FIRE" size={15} />
                  <span className="font-bold text-white">{formatQuantity(row.fire)}</span>
                  <span className="text-[10px] text-rose-400/80 uppercase">Fire</span>
                </div>
              )}
              {row.dust > 0 && (
                <div
                  className="flex items-center gap-1.5 bg-[#251a2c] px-2.5 py-1 rounded-xl text-xs font-mono text-purple-300 shadow-sm"
                  title={`${row.dust.toFixed(4)} Dust`}
                >
                  <ResourceIcon symbol="DUST" size={15} />
                  <span className="font-bold text-white">{formatQuantity(row.dust)}</span>
                  <span className="text-[10px] text-purple-400/80 uppercase">Dust</span>
                </div>
              )}
              {row.lumber > 0 && (
                <div
                  className="flex items-center gap-1.5 bg-[#1c2618] px-2.5 py-1 rounded-xl text-xs font-mono text-lime-300 shadow-sm"
                  title={`${row.lumber.toFixed(4)} Lumber`}
                >
                  <ResourceIcon symbol="LUMBER" size={15} />
                  <span className="font-bold text-white">{formatQuantity(row.lumber)}</span>
                  <span className="text-[10px] text-lime-400/80 uppercase">Lumber</span>
                </div>
              )}
              {row.powerPerUnit > 0 && (
                <div
                  className="flex items-center gap-1.5 bg-[#112028] px-2.5 py-1 rounded-xl text-xs font-mono text-cyan-300 shadow-sm"
                  title={`${row.powerPerUnit.toFixed(2)} Power por unidad`}
                >
                  <BatteryChargeBoldDuotone size={15} className="text-cyan-400" />
                  <span className="font-bold text-white">{formatQuantity(row.powerPerUnit)}</span>
                  <span className="text-[10px] text-cyan-400/80 uppercase">Power</span>
                </div>
              )}
            </div>

            {/* Bottom: Financial Stats & Profit Badge */}
            <div className="grid grid-cols-3 items-center gap-2 pt-2.5 border-t border-white/5 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-tight">Costo Total</div>
                <div className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  <span>{formatCoin(row.totalCost)}</span>
                  <ResourceIcon symbol="COIN" size={12} />
                </div>
              </div>

              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-tight">Precio Mercado</div>
                <div className="font-semibold text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                  <span>{formatCoin(row.sellPrice)}</span>
                  <ResourceIcon symbol="COIN" size={12} />
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-tight">Ganancia Neta</div>
                <div
                  className="font-bold flex items-center justify-end gap-1 mt-0.5"
                  style={{ color: marginColor }}
                >
                  <span>{row.profit >= 0 ? '+' : ''}{formatCoin(row.profit)}</span>
                  <ResourceIcon symbol="COIN" size={12} />
                  {row.marginPct !== null && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-[#131316] ml-1 shadow-inner">
                      {row.marginPct >= 0 ? '+' : ''}{row.marginPct.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
