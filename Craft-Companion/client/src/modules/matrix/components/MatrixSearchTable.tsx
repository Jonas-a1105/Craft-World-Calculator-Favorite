import React from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { ResourceIcon, FactoryIcon } from '../../../components/GameIcon';

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
  const filteredRows = rows.filter(
    (r) =>
      r.token.toLowerCase().includes(tableSearch.toLowerCase()) ||
      r.output_token.toLowerCase().includes(tableSearch.toLowerCase())
  );

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
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filteredRows.map((r, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <FactoryIcon symbol={r.token} size={20} />
                  <span>{r.token}</span>
                </td>
                <td className="p-3 text-zinc-300">Nv. {r.level}</td>
                <td className="p-3 text-zinc-400">{r.duration_min} min</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
