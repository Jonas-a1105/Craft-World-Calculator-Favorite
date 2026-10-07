import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import type { ValueChainAnalysis } from '../types';
import {
  ArchiveBoldDuotone,
  DollarBoldDuotone,
  Rocket2BoldDuotone,
  FlameBoldDuotone,
  BoltBoldDuotone,
} from 'solar-icon-set';

interface ValueChainKpiGridProps {
  analysis: ValueChainAnalysis;
  selectedToken: string;
  selectedLevel: number;
  language: string;
}

export const ValueChainKpiGrid: React.FC<ValueChainKpiGridProps> = ({
  analysis,
  selectedToken,
  selectedLevel,
  language,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Raw Insumos Required */}
      <div className="bg-[#1c1c20] p-5 rounded-3xl border-none shadow-xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ArchiveBoldDuotone className="w-4 h-4 text-slate-400" />
          <span>{language === 'es' ? 'Insumos Iniciales Usados' : 'Initial Inputs Used'}</span>
        </div>
        <div className="mt-3 space-y-1">
          {Object.entries(analysis.rawMaterialsNeeded).length > 0 ? (
            Object.entries(analysis.rawMaterialsNeeded).map(([tok, amt]) => (
              <div key={tok} className="flex items-center gap-2">
                <ResourceIcon symbol={tok} className="w-5 h-5" />
                <span className="text-xl font-extrabold text-white">
                  {formatNumber(amt, 0)} {tok}
                </span>
              </div>
            ))
          ) : (
            <span className="text-sm font-semibold text-slate-400">
              {language === 'es' ? 'Materia Prima Directa' : 'Direct Raw Material'}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 mt-2">
          {language === 'es'
            ? 'Consumo total de tus parcelas por día'
            : 'Total daily consumption from your plots'}
        </div>
      </div>

      {/* Raw Opportunity Value */}
      <div className="bg-[#1c1c20] p-5 rounded-3xl border-none shadow-xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <DollarBoldDuotone className="w-4 h-4 text-amber-400" />
          <span>{language === 'es' ? 'Valor Vendiéndolo Crudo' : 'Raw Sale Opportunity'}</span>
        </div>
        <div className="mt-3 text-2xl font-black text-amber-400">
          {formatNumber(analysis.rawOpportunityCostDay)}{' '}
          <span className="text-xs font-bold text-amber-500/80">COIN/día</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2">
          {language === 'es'
            ? 'Lo que obtendrías si vendieras la Tierra sin procesar'
            : 'Revenue if selling raw earth directly'}
        </div>
      </div>

      {/* Processed Output Revenue */}
      <div className="bg-[#1c1c20] p-5 rounded-3xl border-none shadow-xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Rocket2BoldDuotone className="w-4 h-4 text-cyan-400" />
          <span>{language === 'es' ? 'Valor Vendiéndolo Procesado' : 'Processed Output Value'}</span>
        </div>
        <div className="mt-3 text-2xl font-black text-cyan-400">
          {formatNumber(analysis.finalOutputValueDay)}{' '}
          <span className="text-xs font-bold text-cyan-500/80">COIN/día</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2">
          {language === 'es'
            ? `Venta total del producto final ${selectedToken} (Nvl ${selectedLevel})`
            : `Total sale of finished product ${selectedToken} (Lvl ${selectedLevel})`}
        </div>
      </div>

      {/* Extra Net Profit Multiplier */}
      <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/60 border-none p-5 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <FlameBoldDuotone className="w-4 h-4 text-emerald-400" />
          <span>{language === 'es' ? 'Ganancia Extra por Crafteo' : 'Crafting Value Add'}</span>
        </div>
        <div className="mt-3 text-3xl font-black text-emerald-300">
          +{formatNumber(analysis.netProfitDay)}{' '}
          <span className="text-xs font-bold text-emerald-400">COIN/día</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-emerald-300 bg-emerald-900/60 border-none px-2.5 py-1 rounded-full w-fit">
          <BoltBoldDuotone className="w-3.5 h-3.5" />
          <span>+{formatNumber(analysis.totalMultiplier, 1)}% Extra Profit</span>
        </div>
      </div>
    </div>
  );
};
