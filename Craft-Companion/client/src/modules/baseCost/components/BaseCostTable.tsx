import React from 'react';
import type { BaseCostRowData, CategoryKey } from '../types';
import { BASE_COST_CATEGORIES } from '../data/baseCostCatalog';
import { BaseCostLevelSelector } from './BaseCostLevelSelector';
import { BaseCostMasterySelector } from './BaseCostMasterySelector';
import {
  formatCoin,
  formatQuantity,
  getMarginTextColor,
} from '../services/baseCostCalculatorService';
import { LinkCircleLinear } from 'solar-icon-set';

interface BaseCostTableProps {
  groupedRows: Map<CategoryKey, BaseCostRowData[]>;
  onLevelChange: (token: string, level: number) => void;
  onMasteryChange: (token: string, mastery: number) => void;
  onMaxLevels: () => void;
  onMaxMasteries: () => void;
}

export const BaseCostTable: React.FC<BaseCostTableProps> = ({
  groupedRows,
  onLevelChange,
  onMasteryChange,
  onMaxLevels,
  onMaxMasteries,
}) => {
  return (
    <div className="w-full rounded-3xl bg-[#18181c] shadow-2xl overflow-hidden ring-1 ring-white/10">
      {/* Table Subheader */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#141417]">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
          Costo Base & Ganancia Neta · Por 1 unidad crafteada
        </span>
        <span className="text-[11px] font-mono text-slate-500">
          Valores calculados desde la cadena primaria
        </span>
      </div>

      {/* Responsive Horizontal Scroll Container */}
      <div className="overflow-x-auto [scrollbar-color:#2a2a32_#18181c] [scrollbar-width:thin]">
        <table className="w-full border-collapse text-left">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#141417] text-[11px] font-mono uppercase tracking-wider text-slate-400 select-none">
              <th className="sticky left-0 z-20 bg-[#141417] px-4 py-3 min-w-[170px] shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                Recurso
              </th>
              <th className="px-2 py-3 text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Lvl</span>
                  <button
                    onClick={onMaxLevels}
                    title="Maximizar todos los niveles"
                    className="w-4 h-4 rounded bg-[#222228] text-amber-400 hover:bg-amber-400 hover:text-black text-[9px] font-bold transition-all"
                  >
                    M
                  </button>
                </div>
              </th>
              <th className="px-2 py-3 text-center min-w-[70px]">
                <div className="flex items-center justify-center gap-1">
                  <span>Mast</span>
                  <button
                    onClick={onMaxMasteries}
                    title="Maximizar todas las maestrías"
                    className="w-4 h-4 rounded bg-[#27234d] text-purple-400 hover:bg-purple-400 hover:text-white text-[9px] font-bold transition-all"
                  >
                    M
                  </button>
                </div>
              </th>
              <th className="w-px bg-slate-800/40 p-0" aria-hidden="true" />
              {/* Elementals */}
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-amber-400">
                  <img src="/assets/resources/Earth.png" alt="" className="w-3.5 h-3.5" />
                  Earth
                </span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-blue-400">
                  <img src="/assets/resources/Water.png" alt="" className="w-3.5 h-3.5" />
                  Water
                </span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-rose-400">
                  <img src="/assets/resources/Fire.png" alt="" className="w-3.5 h-3.5" />
                  Fire
                </span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-purple-400">
                  <img src="/assets/resources/Dust.png" alt="" className="w-3.5 h-3.5" />
                  Dust
                </span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-lime-400">
                  <img src="/assets/resources/Lumber.png" alt="" className="w-3.5 h-3.5" />
                  Lumber
                </span>
              </th>
              <th className="w-px bg-slate-800/40 p-0" aria-hidden="true" />
              {/* Financial Costs */}
              <th className="px-3 py-3 text-right whitespace-nowrap">Base Cost</th>
              <th className="px-3 py-3 text-right whitespace-nowrap">Power Cost</th>
              <th className="px-3 py-3 text-right whitespace-nowrap">Total Cost</th>
              <th className="px-3 py-3 text-right whitespace-nowrap">Precio Venta</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Ganancia Neta</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/5">
            {BASE_COST_CATEGORIES.map((cat) => {
              const rows = groupedRows.get(cat.id) || [];
              if (rows.length === 0) return null;

              return (
                <React.Fragment key={cat.id}>
                  {/* Category Header Row */}
                  <tr className="bg-[#141417]">
                    <td
                      colSpan={14}
                      className="sticky left-0 z-10 px-4 py-2 bg-[#141417]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold tracking-wider uppercase ${cat.textColor}`}>
                          ▸ {cat.labelEs}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ({rows.length} recursos)
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Resource Data Rows */}
                  {rows.map((row) => {
                    const marginColor = getMarginTextColor(row.marginPct);

                    return (
                      <tr
                        key={row.token}
                        className="hover:bg-[#202026]/70 transition-colors group"
                      >
                        {/* Sticky Resource Column */}
                        <td className="sticky left-0 z-10 bg-[#18181c] group-hover:bg-[#202026] px-4 py-2.5 shadow-[2px_0_5px_rgba(0,0,0,0.3)] transition-colors">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={row.iconUrl}
                              alt={row.name}
                              className="w-6 h-6 object-contain shrink-0"
                              loading="lazy"
                            />
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono text-xs font-semibold text-slate-100 truncate">
                                {row.name}
                              </span>
                              {row.poolUrl && (
                                <a
                                  href={row.poolUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`Ver ${row.name} en Defined.fi`}
                                  className="text-slate-500 hover:text-purple-400 transition-colors shrink-0"
                                >
                                  <LinkCircleLinear size={13} />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Factory Level */}
                        <td className="px-2 py-2.5 text-center">
                          <BaseCostLevelSelector
                            token={row.token}
                            curLevel={row.curLevel}
                            maxLevel={row.maxLevel}
                            onLevelChange={onLevelChange}
                          />
                        </td>

                        {/* Factory Mastery */}
                        <td className="px-2 py-2.5 text-center">
                          <BaseCostMasterySelector
                            token={row.token}
                            mastery={row.mastery}
                            onMasteryChange={onMasteryChange}
                          />
                        </td>

                        <td className="w-px bg-slate-800/40 p-0" aria-hidden="true" />

                        {/* Elemental Requirements */}
                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-300"
                          title={row.earth > 0 ? `${row.earth.toFixed(4)} Earth` : undefined}
                        >
                          {row.earth > 0 ? (
                            <span className="inline-flex items-center justify-end gap-1 text-slate-200">
                              {formatQuantity(row.earth)}
                              <img src="/assets/resources/Earth.png" alt="" className="w-3 h-3 shrink-0" />
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-300"
                          title={row.water > 0 ? `${row.water.toFixed(4)} Water` : undefined}
                        >
                          {row.water > 0 ? (
                            <span className="inline-flex items-center justify-end gap-1 text-slate-200">
                              {formatQuantity(row.water)}
                              <img src="/assets/resources/Water.png" alt="" className="w-3 h-3 shrink-0" />
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-300"
                          title={row.fire > 0 ? `${row.fire.toFixed(4)} Fire` : undefined}
                        >
                          {row.fire > 0 ? (
                            <span className="inline-flex items-center justify-end gap-1 text-slate-200">
                              {formatQuantity(row.fire)}
                              <img src="/assets/resources/Fire.png" alt="" className="w-3 h-3 shrink-0" />
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-300"
                          title={row.dust > 0 ? `${row.dust.toFixed(4)} Dust` : undefined}
                        >
                          {row.dust > 0 ? (
                            <span className="inline-flex items-center justify-end gap-1 text-slate-200">
                              {formatQuantity(row.dust)}
                              <img src="/assets/resources/Dust.png" alt="" className="w-3 h-3 shrink-0" />
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-300"
                          title={row.lumber > 0 ? `${row.lumber.toFixed(4)} Lumber` : undefined}
                        >
                          {row.lumber > 0 ? (
                            <span className="inline-flex items-center justify-end gap-1 text-slate-200">
                              {formatQuantity(row.lumber)}
                              <img src="/assets/resources/Lumber.png" alt="" className="w-3 h-3 shrink-0" />
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="w-px bg-slate-800/40 p-0" aria-hidden="true" />

                        {/* Base Cost */}
                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-300"
                          title={`${row.baseCost.toFixed(6)} COIN`}
                        >
                          {row.baseCost > 0 ? (
                            <span className="inline-flex items-center justify-end gap-1">
                              {formatCoin(row.baseCost)}
                              <img src="/assets/resources/Coin.png" alt="" className="w-3 h-3 shrink-0" />
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Power Cost */}
                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-400"
                          title={`${row.powerCoin.toFixed(6)} COIN`}
                        >
                          {row.powerCoin > 0 ? (
                            <span className="inline-flex items-center justify-end gap-1 text-cyan-300">
                              {formatCoin(row.powerCoin)}
                              <img src="/assets/resources/Coin.png" alt="" className="w-3 h-3 shrink-0" />
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Total Cost */}
                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums font-semibold text-slate-200"
                          title={`${row.totalCost.toFixed(6)} COIN`}
                        >
                          <span className="inline-flex items-center justify-end gap-1">
                            {formatCoin(row.totalCost)}
                            <img src="/assets/resources/Coin.png" alt="" className="w-3 h-3 shrink-0" />
                          </span>
                        </td>

                        {/* Current Sell Price */}
                        <td
                          className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-slate-300"
                          title={`${row.sellPrice.toFixed(6)} COIN`}
                        >
                          <span className="inline-flex items-center justify-end gap-1">
                            {formatCoin(row.sellPrice)}
                            <img src="/assets/resources/Coin.png" alt="" className="w-3 h-3 shrink-0" />
                          </span>
                        </td>

                        {/* Profit & Margin */}
                        <td
                          className="px-4 py-2.5 text-right font-mono text-xs tabular-nums font-bold"
                          style={{ color: marginColor }}
                          title={`${row.profit.toFixed(6)} COIN`}
                        >
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <span>{row.profit >= 0 ? '+' : ''}{formatCoin(row.profit)}</span>
                            <img src="/assets/resources/Coin.png" alt="" className="w-3 h-3 shrink-0" />
                            {row.marginPct !== null && (
                              <span className="text-[10px] font-mono opacity-80 px-1 py-0.5 rounded bg-[#100e24]">
                                {row.marginPct >= 0 ? '+' : ''}{row.marginPct.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#18162e] text-[11px] font-mono text-slate-500">
        <span>Todas las cantidades expresadas por 1 unidad de producto elaborado.</span>
        <span>Haz click en el nivel para editar o en el ícono de enlace para ver Defined.fi</span>
      </div>
    </div>
  );
};
