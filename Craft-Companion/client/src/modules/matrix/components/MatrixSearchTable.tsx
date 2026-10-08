import React, { useMemo } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { ResourceIcon, FactoryIcon } from '../../../components/GameIcon';
import { useAppStore } from '../../../store/useAppStore';

export interface MatrixSearchTableProps {
  rows: FactoryDataRow[];
  tableSearch: string;
  setTableSearch: (query: string) => void;
  language: 'es' | 'en';
}

export const MatrixSearchTable: React.FC<MatrixSearchTableProps> = ({
  rows,
  tableSearch,
  setTableSearch,
  language,
}) => {
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  const filteredRows = useMemo(() => {
    const list = rows.filter(
      (r) =>
        r.token.toLowerCase().includes(tableSearch.toLowerCase()) ||
        r.output_token.toLowerCase().includes(tableSearch.toLowerCase()),
    );
    return list.sort((a, b) => {
      const aFav = favorites.includes(a.token.toUpperCase());
      const bFav = favorites.includes(b.token.toUpperCase());
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [rows, tableSearch, favorites]);

  return (
    <div className="bg-[#18181b] rounded-[28px] p-5 border-none space-y-4 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder={
            language === 'es'
              ? 'Buscar fábrica o recurso...'
              : 'Search factory or resource...'
          }
          value={tableSearch}
          onChange={(e) => setTableSearch(e.target.value)}
          className="w-full max-w-sm bg-[#141416] border-none rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 shadow-inner"
        />
        <span className="text-xs text-zinc-400 font-mono">
          {rows.length} {language === 'es' ? 'recetas' : 'recipes'}
        </span>
      </div>

      <div className="overflow-x-auto max-h-[600px] rounded-2xl border-none">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#202024] text-zinc-400 font-bold sticky top-0 z-10 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">
                {language === 'es' ? 'Fábrica' : 'Factory'}
              </th>
              <th className="p-3">
                {language === 'es' ? 'Nivel' : 'Level'}
              </th>
              <th className="p-3">
                {language === 'es' ? 'Tiempo' : 'Time'}
              </th>
              <th className="p-3">
                {language === 'es' ? 'Insumo 1' : 'Input 1'}
              </th>
              <th className="p-3">
                {language === 'es' ? 'Insumo 2' : 'Input 2'}
              </th>
              <th className="p-3">
                {language === 'es' ? 'Salida' : 'Output'}
              </th>
              <th className="p-3 text-right">
                {language === 'es' ? 'Rendimiento' : 'Yield'}
              </th>
              <th className="p-3 text-right">
                {language === 'es' ? 'Energía' : 'Power'}
              </th>
              <th className="p-3 text-right">
                {language === 'es' ? 'XP' : 'XP'}
              </th>
              <th className="p-3 text-right">
                {language === 'es' ? 'Prod/Día' : 'Daily Prod'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filteredRows.map((r, i) => {
              const isFav = favorites.includes(r.token.toUpperCase());
              return (
                <tr key={i} className={`hover:bg-white/5 transition-colors ${isFav ? 'bg-amber-500/5' : ''}`}>
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(r.token)}
                      className="p-1 rounded hover:bg-white/10 transition-colors focus:outline-none"
                      title={isFav ? 'Quitar favorito' : 'Marcar favorito'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={isFav ? '#fbbf24' : 'none'}
                        stroke={isFav ? '#fbbf24' : '#52525b'}
                        strokeWidth="2"
                        className="w-3.5 h-3.5"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    <FactoryIcon symbol={r.token} size={20} />
                    <span>{r.token}</span>
                  </td>
                <td className="p-3 text-zinc-300">Nv. {r.level}</td>
                <td className="p-3 text-zinc-400 font-mono text-[11px]">
                  {r.duration_raw || `${r.duration_min} min`}
                </td>
                <td className="p-3">
                  {r.input_token_1 ? (
                    <span className="flex items-center gap-1.5">
                      <ResourceIcon symbol={r.input_token_1} size={16} />
                      {r.input_amount_1} {r.input_token_1}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3">
                  {r.input_token_2 ? (
                    <span className="flex items-center gap-1.5">
                      <ResourceIcon symbol={r.input_token_2} size={16} />
                      {r.input_amount_2} {r.input_token_2}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3 font-bold text-emerald-400 flex items-center gap-1.5">
                  <ResourceIcon symbol={r.output_token} size={18} />
                  {r.output_amount} {r.output_token}
                </td>
                <td className="p-3 text-right font-mono text-cyan-400 font-medium">
                  {r.yield_percent !== undefined ? `${r.yield_percent}%` : '100%'}
                </td>
                <td className="p-3 text-right font-mono text-amber-400">
                  {r.power_cost ? (
                    <span className="inline-flex items-center gap-1 justify-end">
                      <span className="text-[10px] text-amber-500/80">⚡</span>
                      {r.power_cost >= 1000 ? `${(r.power_cost / 1000).toFixed(0)}k` : r.power_cost}
                    </span>
                  ) : (
                    <span className="text-zinc-600">0</span>
                  )}
                </td>
                <td className="p-3 text-right font-mono text-purple-400">
                  {r.xp_per_output ? (
                    <span className="inline-flex items-center gap-1 justify-end">
                      <span className="text-[10px] text-purple-500/80">★</span>
                      {r.xp_per_output >= 1000000
                        ? `${(r.xp_per_output / 1000000).toFixed(1)}M`
                        : r.xp_per_output >= 1000
                        ? `${(r.xp_per_output / 1000).toFixed(0)}k`
                        : r.xp_per_output}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="p-3 text-right font-mono text-emerald-400 font-semibold">
                  {r.daily_production ? r.daily_production.toLocaleString() : '—'}
                </td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
