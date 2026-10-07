import React from 'react';
import { ResourceIcon, FactoryIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import type { ValueChainAnalysis } from '../types';
import { LeafBoldDuotone } from 'solar-icon-set';

interface ValueChainStepFlowProps {
  analysis: ValueChainAnalysis;
  language: string;
}

export const ValueChainStepFlow: React.FC<ValueChainStepFlowProps> = ({
  analysis,
  language,
}) => {
  return (
    <div className="bg-[#1c1c20] p-6 rounded-3xl border-none shadow-2xl">
      <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
        <LeafBoldDuotone className="w-5 h-5 text-emerald-400" />
        <span>
          {language === 'es'
            ? 'Cadena de Producción Paso a Paso'
            : 'Step-by-Step Production Chain'}
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {/* Step 0: Raw Harvest Card */}
        <div className="bg-[#151518] p-5 rounded-2xl border-none shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-950 px-2 py-0.5 rounded-full border-none">
                {language === 'es' ? 'Paso #0 — Inicio' : 'Step #0 — Start'}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {language === 'es' ? '$0 Costo' : '$0 Cost'}
              </span>
            </div>

            <div className="flex items-center gap-3 my-3">
              <ResourceIcon symbol="EARTH" className="w-10 h-10 drop-shadow-md" />
              <div>
                <div className="text-base font-extrabold text-white">EARTH</div>
                <div className="text-xs font-semibold text-slate-400">
                  {language === 'es' ? 'Farmeo de Parcelas' : 'Land Farming'}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1 mt-3 pt-3 border-none">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  {language === 'es' ? 'Total Recolectado:' : 'Total Harvested:'}
                </span>
                <span className="font-bold text-white font-mono">
                  {formatNumber(Object.values(analysis.rawMaterialsNeeded)[0] || 0, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">
                  {language === 'es' ? 'Valor de Mercado:' : 'Market Value:'}
                </span>
                <span className="font-bold text-yellow-400 font-mono">
                  {formatNumber(analysis.rawOpportunityCostDay)} COIN/día
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Cards */}
        {analysis.steps.map((st) => (
          <div
            key={st.token}
            className="bg-[#151518] border-none transition-all p-5 rounded-2xl shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider bg-cyan-950 px-2 py-0.5 rounded-full border-none">
                  {language === 'es' ? `Paso #${st.stepIndex}` : `Step #${st.stepIndex}`}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border-none">
                  {language === 'es' ? `Nivel ${st.factoryLevel}` : `Level ${st.factoryLevel}`}
                </span>
              </div>

              <div className="flex items-center gap-3 my-3">
                <FactoryIcon
                  symbol={st.token}
                  className="w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform"
                />
                <div>
                  <div className="text-base font-extrabold text-white">{st.token}</div>
                  <div className="text-xs font-semibold text-cyan-400">
                    {st.masteryDiscountPercent > 0
                      ? `-${formatNumber(st.masteryDiscountPercent, 1)}% ${
                          language === 'es' ? 'Maestría' : 'Mastery'
                        }`
                      : language === 'es'
                        ? 'Fábrica'
                        : 'Factory'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 mt-3 pt-3 border-none font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    {language === 'es' ? 'Insumos/Ciclo:' : 'Inputs/Cycle:'}
                  </span>
                  <span className="font-bold text-slate-200">
                    {st.input1Token &&
                      `${formatNumber(st.input1AmountPerCycle, 1)} ${st.input1Token}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    {language === 'es' ? 'Producción/Ciclo:' : 'Output/Cycle:'}
                  </span>
                  <span className="font-bold text-emerald-400">
                    {formatNumber(st.outputAmountPerCycle, 0)} {st.token}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-none">
                  <span className="text-slate-400">
                    {language === 'es' ? 'Profit Agregado/Día:' : 'Value Add/Day:'}
                  </span>
                  <span className="font-extrabold text-emerald-400">
                    +{formatNumber(st.netProfitPerDay)} COIN
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
