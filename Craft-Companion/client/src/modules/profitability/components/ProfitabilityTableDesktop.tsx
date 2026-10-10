import React from 'react';
import { useTranslation } from '../../../utils/i18n';
import { FactoryIcon } from '../../../components/GameIcon';
import type { FactoryTableRow, TableSortField, SortDirection, BoostOption } from '../types';
import { formatNumber } from '../../../utils/formatters';

interface ProfitabilityTableDesktopProps {
  rows: FactoryTableRow[];
  sortBy: TableSortField;
  sortDirection: SortDirection;
  onSortChange: (field: TableSortField) => void;
  onSelectFactoryModal: (token: string) => void;
  isFavorite: (token: string) => boolean;
  onToggleFavorite: (token: string) => void;

  // Inline row edits
  onIncrementCount: (token: string) => void;
  onDecrementCount: (token: string) => void;
  onSetLevel: (token: string, level: number) => void;
  onSetMaxLevel: (token: string) => void;
  onIncrementMastery: (token: string) => void;
  onDecrementMastery: (token: string) => void;
  onSetBoost: (token: string, boost: BoostOption) => void;
}

export const ProfitabilityTableDesktop: React.FC<ProfitabilityTableDesktopProps> = ({
  rows,
  sortBy,
  sortDirection,
  onSortChange,
  onSelectFactoryModal,
  isFavorite,
  onToggleFavorite,
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

  const renderSortIndicator = (field: TableSortField) => {
    if (sortBy !== field) return null;
    return (
      <span className="ml-1 text-amber-400 font-bold">
        {sortDirection === 'desc' ? '▼' : '▲'}
      </span>
    );
  };

  return (
    <div className="w-full bg-[#18181b] rounded-[32px] shadow-2xl overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse select-none">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-zinc-800/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider bg-black/20">
              {/* 1. RESOURCE */}
              <th
                onClick={() => onSortChange('resource')}
                className="py-3.5 pl-6 pr-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>{isEs ? 'Recurso' : 'Resource'}</span>
                  {renderSortIndicator('resource')}
                </div>
              </th>

              {/* 2. PRICE (COIN) */}
              <th
                onClick={() => onSortChange('price')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{isEs ? 'Precio (COIN)' : 'Price (COIN)'}</span>
                  {renderSortIndicator('price')}
                </div>
              </th>

              {/* 3. Δ 1H */}
              <th
                onClick={() => onSortChange('change1h')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Δ 1H</span>
                  {renderSortIndicator('change1h')}
                </div>
              </th>

              {/* 4. Δ 24H */}
              <th
                onClick={() => onSortChange('change24h')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Δ 24H</span>
                  {renderSortIndicator('change24h')}
                </div>
              </th>

              {/* 5. # FACTORIES */}
              <th
                onClick={() => onSortChange('count')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{isEs ? '# Fábricas' : '# Factories'}</span>
                  {renderSortIndicator('count')}
                </div>
              </th>

              {/* 6. LEVEL */}
              <th
                onClick={() => onSortChange('level')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{isEs ? 'Nivel' : 'Level'}</span>
                  {renderSortIndicator('level')}
                </div>
              </th>

              {/* 7. MASTERY */}
              <th
                onClick={() => onSortChange('mastery')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{isEs ? 'Maestría' : 'Mastery'}</span>
                  {renderSortIndicator('mastery')}
                </div>
              </th>

              {/* 8. WORKERS % */}
              <th className="py-3.5 px-3 text-center text-zinc-400">
                <span>Workers %</span>
              </th>

              {/* 9. WORKSHOP % */}
              <th className="py-3.5 px-3 text-center text-zinc-400">
                <span>Workshop %</span>
              </th>

              {/* 10. BOOST */}
              <th className="py-3.5 px-3 text-center text-zinc-400">
                <span>Boost</span>
              </th>

              {/* 11. POWER COST/H */}
              <th
                onClick={() => onSortChange('power')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{isEs ? 'Energía/h' : 'Power cost/h'}</span>
                  {renderSortIndicator('power')}
                </div>
              </th>

              {/* 12. PROFIT/H */}
              <th
                onClick={() => onSortChange('profit')}
                className="py-3.5 pl-3 pr-6 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{isEs ? 'Ganancia/h' : 'Profit/h'}</span>
                  {renderSortIndicator('profit')}
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-800/40 text-xs text-zinc-200">
            {rows.map((row) => {
              const isFav = isFavorite(row.token);
              const isActive = row.count > 0;
              const isProfitable = row.profitPerHour > 0;
              const isLoss = row.profitPerHour < 0;

              return (
                <tr
                  key={row.token}
                  className={`transition-colors duration-100 ${
                    isActive ? 'bg-white/[0.01] hover:bg-white/[0.04]' : 'opacity-85 hover:opacity-100 hover:bg-white/[0.02]'
                  }`}
                >
                  {/* 1. RESOURCE (Icon + Token + Star + Drill-down) */}
                  <td className="py-3.5 pl-6 pr-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(row.token)}
                        className={`text-sm transition-transform hover:scale-110 ${
                          isFav ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                        title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      >
                        ★
                      </button>

                      <div
                        onClick={() => onSelectFactoryModal(row.token)}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center flex-shrink-0">
                          <FactoryIcon symbol={row.token} size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
                              {row.token}
                            </span>
                            {row.isModified && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-amber-400"
                                title={isEs ? 'Configuración simulada editada' : 'Custom simulation modified'}
                              />
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 capitalize">
                            {row.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. PRICE (COIN) */}
                  <td className="py-3.5 px-3 text-right font-medium text-white tabular-nums">
                    {formatNumber(row.priceCoin, row.priceCoin < 1 ? 5 : 2)}
                  </td>

                  {/* 3. Δ 1H */}
                  <td className="py-3.5 px-3 text-right tabular-nums">
                    <span
                      className={`text-[11px] font-semibold ${
                        row.change1h > 0
                          ? 'text-emerald-400'
                          : row.change1h < 0
                            ? 'text-rose-400'
                            : 'text-zinc-400'
                      }`}
                    >
                      {row.change1h > 0 ? '▲ ' : row.change1h < 0 ? '▼ ' : ''}
                      {Math.abs(row.change1h).toFixed(2)}%
                    </span>
                  </td>

                  {/* 4. Δ 24H */}
                  <td className="py-3.5 px-3 text-right tabular-nums">
                    <span
                      className={`text-[11px] font-semibold ${
                        row.change24h > 0
                          ? 'text-emerald-400'
                          : row.change24h < 0
                            ? 'text-rose-400'
                            : 'text-zinc-400'
                      }`}
                    >
                      {row.change24h > 0 ? '▲ ' : row.change24h < 0 ? '▼ ' : ''}
                      {Math.abs(row.change24h).toFixed(2)}%
                    </span>
                  </td>

                  {/* 5. # FACTORIES (Stepper [-] [qty] [+]) */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-zinc-800/80 px-2 py-1 rounded-full">
                      <button
                        type="button"
                        onClick={() => onDecrementCount(row.token)}
                        disabled={row.count <= 0}
                        className="w-5 h-5 rounded-full bg-zinc-700/60 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-black flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-extrabold text-white text-xs tabular-nums">
                        {row.count}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrementCount(row.token)}
                        className="w-5 h-5 rounded-full bg-zinc-700/60 hover:bg-zinc-600 text-white text-xs font-black flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* 6. LEVEL (level/max + M Max button) */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs tabular-nums">
                        {row.level}/{row.maxLevel}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSetMaxLevel(row.token)}
                        className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center transition-colors ${
                          row.level >= row.maxLevel
                            ? 'bg-amber-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                        }`}
                        title={isEs ? 'Maximizar nivel' : 'Maximize level'}
                      >
                        M
                      </button>
                    </div>
                  </td>

                  {/* 7. MASTERY (Stepper [-] [level] [+] + % reduction) */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="inline-flex items-center gap-1 bg-zinc-800/80 px-1.5 py-1 rounded-full">
                        <button
                          type="button"
                          onClick={() => onDecrementMastery(row.token)}
                          disabled={row.masteryLevel <= 0}
                          className="w-4 h-4 rounded-full bg-zinc-700/60 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-[10px] font-black flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-bold text-white text-xs tabular-nums">
                          {row.masteryLevel}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrementMastery(row.token)}
                          disabled={row.masteryLevel >= 10}
                          className="w-4 h-4 rounded-full bg-zinc-700/60 hover:bg-zinc-600 disabled:opacity-30 disabled:pointer-events-none text-white text-[10px] font-black flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      {row.masteryReductionPercent > 0 && (
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          +{row.masteryReductionPercent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 8. WORKERS % */}
                  <td className="py-3.5 px-3 text-center tabular-nums">
                    <span className="text-zinc-300 font-medium">
                      +{row.workerPercent}%
                    </span>
                  </td>

                  {/* 9. WORKSHOP % */}
                  <td className="py-3.5 px-3 text-center tabular-nums">
                    <span className="text-zinc-300 font-medium">
                      +{row.workshopPercent}%
                    </span>
                  </td>

                  {/* 10. BOOST (None / x2 selector) */}
                  <td className="py-3.5 px-3 text-center">
                    <select
                      value={row.boost}
                      onChange={(e) => onSetBoost(row.token, e.target.value as BoostOption)}
                      className="bg-zinc-800/80 text-white text-xs font-semibold rounded-full px-2.5 py-1 outline-none cursor-pointer border-none"
                    >
                      <option value="None">None</option>
                      <option value="x2">x2</option>
                    </select>
                  </td>

                  {/* 11. POWER COST/H */}
                  <td className="py-3.5 px-3 text-right tabular-nums">
                    {isActive ? (
                      <span className="font-medium text-zinc-300">
                        {formatNumber(row.powerKwPerHour, 1)} kW
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>

                  {/* 12. PROFIT/H (Net Hourly Coin Badge) */}
                  <td className="py-3.5 pl-3 pr-6 text-right tabular-nums">
                    {isActive ? (
                      <div className="inline-flex items-center gap-1 font-bold">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full ${
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
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
