import React from 'react';
import type { EfficiencyItem } from '../types';
import { EfficiencyTableRow } from './EfficiencyTableRow';

interface EfficiencyTableProps {
  items: EfficiencyItem[];
  onMultiplierChange: (symbol: string, mult: number) => void;
  language: string;
  baseSymbol: string;
}

export const EfficiencyTable: React.FC<EfficiencyTableProps> = ({
  items,
  onMultiplierChange,
  language,
  baseSymbol,
}) => {
  const isEs = language === 'es';

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl bg-[#16161a] p-8 text-center border-none">
        <p className="text-sm font-mono text-slate-400">
          {isEs
            ? 'No se encontraron recursos que coincidan con la búsqueda.'
            : 'No resources found matching the search criteria.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#16161a] overflow-hidden border-none shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-[#1a1a20] text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-3 px-3.5 text-center w-12">#</th>
              <th className="py-3 px-3">{isEs ? 'Recurso' : 'Resource'}</th>
              <th className="py-3 px-3 text-right">{isEs ? 'Coronas' : 'Crowns'}</th>
              <th className="py-3 px-3 text-right">{isEs ? 'Power' : 'Power'}</th>
              <th className="py-3 px-3 text-right">{isEs ? 'Precio Mercado' : 'Market Price'}</th>
              <th className="py-3 px-3 text-right">{isEs ? 'Total Coronas' : 'Total Crowns'}</th>
              <th className="py-3 px-3 text-right">{isEs ? 'Costo Total' : 'Total Cost'}</th>
              <th className="py-3 px-3.5 text-right font-bold text-amber-300">
                {isEs ? 'Coronas / COIN' : 'Crowns / COIN'}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <EfficiencyTableRow
                key={item.symbol}
                item={item}
                onMultiplierChange={onMultiplierChange}
                baseSymbol={baseSymbol}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
