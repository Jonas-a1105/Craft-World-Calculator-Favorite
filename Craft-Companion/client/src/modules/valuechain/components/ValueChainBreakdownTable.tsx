import React from 'react';
import { FactoryIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import type { ChainStep } from '../types';
import { ClipboardCheckBoldDuotone } from 'solar-icon-set';

interface ValueChainBreakdownTableProps {
  steps: ChainStep[];
  language: string;
}

export const ValueChainBreakdownTable: React.FC<ValueChainBreakdownTableProps> = ({
  steps,
  language,
}) => {
  return (
    <div className="bg-[#1c1c20] p-6 rounded-3xl border-none shadow-2xl">
      <h2 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
        <ClipboardCheckBoldDuotone className="w-5 h-5 text-indigo-400" />
        <span>
          {language === 'es'
            ? 'Tabla de Desglose de Inversión por Fábrica'
            : 'Factory Investment Breakdown Table'}
        </span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#151518] text-slate-400 uppercase text-[10px] tracking-wider border-none">
            <tr>
              <th className="py-3 px-4">{language === 'es' ? 'Paso' : 'Step'}</th>
              <th className="py-3 px-4">{language === 'es' ? 'Fábrica' : 'Factory'}</th>
              <th className="py-3 px-4">{language === 'es' ? 'Insumos Exigidos' : 'Required Inputs'}</th>
              <th className="py-3 px-4">{language === 'es' ? 'Producción' : 'Output'}</th>
              <th className="py-3 px-4 text-right">{language === 'es' ? 'Profit / Ciclo' : 'Profit / Cycle'}</th>
              <th className="py-3 px-4 text-right">{language === 'es' ? 'Profit / Día' : 'Profit / Day'}</th>
              <th className="py-3 px-4 text-right">{language === 'es' ? 'Ganancia Acumulada' : 'Cumulative Profit'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {steps.map((st) => (
              <tr key={st.token} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-4 font-bold text-slate-500">#{st.stepIndex}</td>
                <td className="py-3 px-4 font-extrabold text-white flex items-center gap-2">
                  <FactoryIcon symbol={st.token} className="w-4 h-4" />
                  <span>
                    {st.token} ({language === 'es' ? 'Nvl' : 'Lvl'} {st.factoryLevel})
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">
                  {st.input1Token && (
                    <span>
                      {formatNumber(st.input1AmountPerCycle, 1)} {st.input1Token}
                    </span>
                  )}
                  {st.input2Token && (
                    <span>
                      {' + '}
                      {formatNumber(st.input2AmountPerCycle, 1)} {st.input2Token}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                  {formatNumber(st.outputAmountPerCycle, 0)} {st.token}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                  +{formatNumber(st.netProfitPerCycle)} COIN
                </td>
                <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400">
                  +{formatNumber(st.netProfitPerDay)} COIN
                </td>
                <td className="py-3 px-4 text-right font-mono font-extrabold text-cyan-400">
                  +{formatNumber(st.cumulativeProfitPerDay)} COIN
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
