import React from 'react';
import type { ValueChainAnalysis } from '../../../../services/valueChainCalculator';
import type { FactorySummary } from '../../types';
import { useTranslation } from '../../../../utils/i18n';
import { formatNumber } from '../../../../utils/formatters';
import { ResourceIcon, FactoryIcon } from '../../../../components/GameIcon';

export interface ValueChainStepViewProps {
  summary: FactorySummary;
  analysis: ValueChainAnalysis | null;
}

export const ValueChainStepView: React.FC<ValueChainStepViewProps> = ({
  summary,
  analysis,
}) => {
  const { language } = useTranslation();

  if (!analysis) {
    return (
      <div className="py-12 text-center text-xs text-zinc-400">
        {language === 'es'
          ? 'No se pudo simular la cadena de este producto.'
          : 'Chain simulation not available.'}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 modal-custom-scroll pr-1.5 space-y-4">
      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#141416] p-4 rounded-[28px] border-none">
          <span className="text-[10px] font-bold text-zinc-400 uppercase block">
            {language === 'es' ? 'Insumos Base Diarios' : 'Daily Base Inputs'}
          </span>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
            {Object.entries(analysis.rawMaterialsNeeded).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <ResourceIcon symbol={k} className="w-4 h-4" />
                {formatNumber(v, 0)}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#141416] p-4 rounded-[28px] border-none">
          <span className="text-[10px] font-bold text-zinc-400 uppercase block">
            {language === 'es' ? 'Venta Cruda (Tierra)' : 'Raw Sale (Earth)'}
          </span>
          <div className="mt-1 text-sm font-bold text-amber-400">
            {formatNumber(analysis.rawOpportunityCostDay)} COIN
          </div>
        </div>

        <div className="bg-[#141416] p-4 rounded-[28px] border-none">
          <span className="text-[10px] font-bold text-zinc-400 uppercase block">
            {language === 'es'
              ? `Venta Procesada (${summary.token})`
              : `Processed Sale (${summary.token})`}
          </span>
          <div className="mt-1 text-sm font-bold text-cyan-400">
            +{formatNumber(analysis.finalOutputValueDay)} COIN
          </div>
        </div>

        <div className="bg-emerald-500/10 p-4 rounded-[28px] border-none">
          <span className="text-[10px] font-bold text-emerald-400 uppercase block">
            {language === 'es' ? 'Ganancia Extra Neta' : 'Net Extra Profit'}
          </span>
          <div className="mt-1 text-sm font-black text-emerald-300">
            +{formatNumber(analysis.netProfitDay)} COIN/día
          </div>
        </div>
      </div>

      {/* Steps Progression Flow */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          {language === 'es'
            ? 'Flujo de Transformación de la Fábrica'
            : 'Factory Transformation Flow'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {analysis.steps.map((st, idx) => (
            <div
              key={st.token}
              className="bg-[#141416] p-5 rounded-[28px] border-none relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    {language === 'es' ? `Paso #${idx + 1}` : `Step #${idx + 1}`}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {st.cyclesPerDay.toFixed(1)}{' '}
                    {language === 'es' ? 'ciclos/día' : 'cycles/day'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FactoryIcon symbol={st.token} size={32} />
                  <div>
                    <h5 className="font-bold text-white text-sm">{st.token}</h5>
                    <span className="text-[11px] text-zinc-400">
                      Nv. {st.factoryLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {language === 'es' ? 'Ganancia Neta:' : 'Net Profit:'}
                </span>
                <span className="font-bold text-emerald-400">
                  +{formatNumber(st.netProfitPerDay)} COIN/día
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
