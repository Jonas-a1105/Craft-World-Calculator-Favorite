import React, { useRef, useEffect } from 'react';
import type { MatrixCellProfit } from '../types';
import { ResourceIcon } from '../../../components/GameIcon';
import {
  formatProfit,
  formatCompactPrice,
  getCellBgClass,
} from '../services/matrixService';

export interface MatrixHeatmapTableProps {
  visibleResources: string[];
  levels: number[];
  masteryMap: Record<string, number>;
  setMasteryForResource: (resource: string, level: number) => void;
  openMasteryRes: string | null;
  setOpenMasteryRes: (res: string | null) => void;
  priceMap: Record<string, number>;
  setPriceMap: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  getCellProfit: (resource: string, level: number) => MatrixCellProfit;
}

export const MatrixHeatmapTable: React.FC<MatrixHeatmapTableProps> = ({
  visibleResources,
  levels,
  masteryMap,
  setMasteryForResource,
  openMasteryRes,
  setOpenMasteryRes,
  priceMap,
  setPriceMap,
  getCellProfit,
}) => {
  const masteryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (masteryRef.current && !masteryRef.current.contains(e.target as Node)) {
        setOpenMasteryRes(null);
      }
    }
    if (openMasteryRes) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMasteryRes, setOpenMasteryRes]);

  return (
    <div className="bg-[#18181b] rounded-[24px] border-none shadow-2xl relative">
      <div className="overflow-x-auto modal-custom-scroll [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
        <table className="w-full border-separate border-spacing-0 text-left font-mono select-none">
          {/* CABECERA 1: MASTERY / MAESTRÍAS */}
          <thead className="sticky top-0 z-30 bg-[#161619] shadow-md">
            <tr className="border-b border-white/[0.04]">
              {/* Celda de esquina izquierda - Fija en scroll horizontal */}
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 50,
                  backgroundColor: '#161619',
                }}
                className="matrix-sticky-col p-0.5 text-[8.5px] font-bold text-zinc-400 uppercase tracking-wider text-center min-w-[32px] w-[32px] border-r border-b border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
              >
                MAST.
              </th>
              {visibleResources.map((res) => {
                const curMastery = masteryMap[res] ?? 0;
                return (
                  <th
                    key={`mast_${res}`}
                    className="p-0.5 text-center min-w-[34px] max-w-[38px] w-[36px] relative border-b border-white/[0.04]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMasteryRes(openMasteryRes === res ? null : res)
                      }
                      className="w-full py-0.5 px-0.5 rounded bg-[#141416] hover:bg-[#202024] text-[8.5px] font-mono font-bold text-amber-300 flex items-center justify-center gap-0.5 border-none cursor-pointer shadow-inner transition-colors"
                      title={`Maestría para ${res}: ${curMastery} ★`}
                    >
                      <span>{curMastery}</span>
                      <span className="text-[6.5px] text-zinc-500">▼</span>
                    </button>
                    {openMasteryRes === res && (
                      <div
                        ref={masteryRef}
                        className="absolute top-full left-0 z-50 mt-1 bg-[#18181b] rounded-xl shadow-2xl p-1 border border-white/[0.08] w-20 max-h-48 overflow-y-auto modal-custom-scroll animate-in fade-in zoom-in-95 duration-100"
                        style={{
                          boxShadow: '0 16px 40px -6px rgba(0, 0, 0, 0.85)',
                        }}
                      >
                        {Array.from({ length: 11 }, (_, i) => {
                          const isSelected = curMastery === i;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setMasteryForResource(res, i);
                                setOpenMasteryRes(null);
                              }}
                              className={`w-full !bg-transparent flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer text-left transition-colors ${
                                isSelected
                                  ? '!text-emerald-400 bg-white/[0.05]'
                                  : '!text-zinc-300 hover:!text-white hover:bg-white/[0.04]'
                              }`}
                            >
                              <span>{i} ★</span>
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-emerald-400"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>

            {/* CABECERA 2: PRECIOS */}
            <tr className="border-b border-white/[0.04] bg-[#141416]">
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 50,
                  backgroundColor: '#141416',
                }}
                className="matrix-sticky-col p-0.5 text-[8.5px] font-bold text-zinc-400 uppercase tracking-wider text-center min-w-[32px] w-[32px] border-r border-b border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
              >
                PRICE
              </th>
              {visibleResources.map((res) => {
                const curPrice = priceMap[res];
                return (
                  <th
                    key={`price_${res}`}
                    className="p-0.5 text-center min-w-[34px] max-w-[38px] w-[36px] border-b border-white/[0.04]"
                  >
                    <input
                      type="text"
                      value={
                        curPrice !== undefined
                          ? formatCompactPrice(curPrice)
                          : ''
                      }
                      onChange={(e) => {
                        const val =
                          parseFloat(e.target.value.replace('k', '000')) || 0;
                        setPriceMap((prev) => ({ ...prev, [res]: val }));
                      }}
                      className="w-full bg-transparent hover:bg-white/5 focus:bg-[#202024] text-amber-300 font-mono text-[8px] sm:text-[8.5px] font-bold text-center rounded px-0 py-0.5 border-none outline-none focus:ring-1 focus:ring-amber-400/50 cursor-pointer"
                      placeholder="0"
                      title={`Precio para ${res}: ${curPrice ?? 0} COIN`}
                    />
                  </th>
                );
              })}
            </tr>

            {/* CABECERA 3: ICONOS Y NOMBRES DE RECURSOS */}
            <tr className="border-b border-white/10 bg-[#16161a]">
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 50,
                  backgroundColor: '#16161a',
                }}
                className="matrix-sticky-col p-0.5 text-[9px] font-bold text-white uppercase tracking-wider text-center min-w-[32px] w-[32px] border-r border-b border-white/15 shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
              >
                Lv.
              </th>
              {visibleResources.map((res) => (
                <th
                  key={`icon_${res}`}
                  className="p-1 px-0.5 text-center min-w-[34px] max-w-[38px] w-[36px] hover:bg-white/5 transition-colors cursor-pointer border-b border-white/10"
                  title={res}
                >
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <ResourceIcon symbol={res} size={14} />
                    <span className="text-[7px] font-sans font-extrabold text-zinc-300 truncate max-w-[34px] leading-tight block text-center">
                      {res}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* CUERPO: FILAS POR NIVEL (Lv. 1 a Lv. 20) */}
          <tbody>
            {levels.map((lvl) => (
              <tr
                key={lvl}
                className="hover:bg-white/[0.02] transition-colors"
              >
                {/* Columna Sticky izquierda con el Nivel */}
                <td
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 30,
                    backgroundColor: '#151518',
                  }}
                  className="matrix-sticky-col p-0.5 text-center text-[9px] font-bold text-zinc-300 border-r border-b border-white/10 select-none min-w-[32px] w-[32px] shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
                >
                  {lvl}
                </td>

                {/* Celdas con Heatmap y Valores de Ganancia */}
                {visibleResources.map((res) => {
                  const { profit, valid, runtime } = getCellProfit(res, lvl);
                  const cellBg = getCellBgClass(profit, valid);

                  return (
                    <td
                      key={`${res}_${lvl}`}
                      className={`p-0.5 px-0 text-center text-[8px] sm:text-[8.5px] font-mono whitespace-nowrap transition-colors border-r border-b border-white/[0.03] min-w-[34px] max-w-[38px] w-[36px] ${cellBg}`}
                      title={
                        valid
                          ? `${res} (Lv. ${lvl})\nProfit: ${formatProfit(profit)} coin/h\nCycle: ${runtime.toFixed(1)} min`
                          : `${res} (No recipe at Lv. ${lvl})`
                      }
                    >
                      {valid ? formatProfit(profit) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
