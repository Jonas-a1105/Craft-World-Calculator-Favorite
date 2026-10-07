import React from 'react';
import { FactoryIcon } from '../../../components/GameIcon';
import { formatFactoryName } from '../../../utils/formatters';
import { formatPlotName, extractPlotFactorySummary } from '../services/empireService';

interface EmpireLandPlotsListProps {
  landPlots: any[];
  language: string;
}

export const EmpireLandPlotsList: React.FC<EmpireLandPlotsListProps> = ({
  landPlots,
  language,
}) => {
  return (
    <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-title text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
          <span>🏔️</span>
          <span>{language === 'es' ? 'Parcelas de Tierra (Land Plots)' : 'Land Plots'}</span>
        </h2>
        <span className="text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full">
          {landPlots.length} {language === 'es' ? 'parcelas activas' : 'active plots'}
        </span>
      </div>

      {landPlots.length ? (
        <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2">
          {landPlots.map((plot: any, idx: number) => {
            const areas = plot?.areas || [];
            const { factories: allPlotFactories, counts: factoryCounts } =
              extractPlotFactorySummary(plot);

            return (
              <div
                key={plot.id || idx}
                className="bg-[#202024] p-4 sm:p-5 rounded-[24px] shadow-sm flex flex-col justify-between gap-3 transition-colors hover:bg-[#25252a]"
              >
                {/* Top Row: Plot Title + Badge */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm sm:text-base truncate flex items-center gap-2">
                      <span>{formatPlotName(plot.name, language)}</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {plot.name} • {areas.length} {language === 'es' ? 'áreas' : 'areas'}
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-400 shrink-0">
                    {language === 'es' ? '✓ Desbloqueada' : '✓ Unlocked'}
                  </span>
                </div>

                {/* Blueprint info if applied */}
                {plot.appliedBlueprint && (
                  <div className="bg-[#18181b] rounded-full px-3 py-1.5 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                      <span>📜</span>
                      <span>{language === 'es' ? 'Plano aplicado:' : 'Blueprint:'}</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-[11px]">
                      {plot.appliedBlueprint.definitionId?.replace('_BLUEPRINT', '')} (
                      {plot.appliedBlueprint.starLevel}⭐)
                    </span>
                  </div>
                )}

                {/* Installed Factories summary */}
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                    {language === 'es' ? 'Fábricas instaladas:' : 'Installed factories:'} (
                    {allPlotFactories.length})
                  </span>
                  {Object.keys(factoryCounts).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(factoryCounts).map(([symbol, count]) => (
                        <span
                          key={symbol}
                          className="bg-[#18181b] px-2.5 py-1 rounded-full text-[11px] text-zinc-200 font-medium flex items-center gap-1.5 shadow-sm"
                        >
                          <FactoryIcon symbol={symbol} size={14} />
                          <span>{formatFactoryName(symbol, language)}</span>
                          <span className="text-amber-400 font-mono font-bold">x{count}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-500 italic">
                      {language === 'es' ? 'Sin fábricas instaladas' : 'No installed factories'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-6 font-main">
          {language === 'es'
            ? 'No se encontraron parcelas asociadas a la cuenta.'
            : 'No land plots found for this account.'}
        </p>
      )}
    </div>
  );
};
