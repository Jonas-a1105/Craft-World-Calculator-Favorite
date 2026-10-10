import React from 'react';
import {
  MapPointBoldDuotone,
  DocumentTextBoldDuotone,
  CheckCircleBold,
  StarBold,
} from 'solar-icon-set';
import { FactoryIcon } from '../../../components/GameIcon';
import { formatFactoryName } from '../../../utils/formatters';
import { formatPlotName, extractPlotFactorySummary } from '../services/empireService';
import type { CraftworldLandPlot } from '../../../types';

interface EmpireLandPlotsListProps {
  landPlots: CraftworldLandPlot[];
  language: string;
}

export const EmpireLandPlotsList: React.FC<EmpireLandPlotsListProps> = ({
  landPlots,
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="space-y-3.5 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <MapPointBoldDuotone className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-white tracking-wide uppercase">
              {isEs ? 'Parcelas de Tierra (Land Plots)' : 'Land Plots'}
            </h2>
            <span className="text-[11px] text-zinc-400">
              {isEs ? 'Configuración de terrenos y fábricas activas' : 'Terrain plots and active production'}
            </span>
          </div>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">
          {landPlots.length} {isEs ? 'parcelas activas' : 'active plots'}
        </span>
      </div>

      {landPlots.length ? (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {landPlots.map((plot: CraftworldLandPlot, idx: number) => {
            const areas = plot?.areas || [];
            const { factories: allPlotFactories, counts: factoryCounts } =
              extractPlotFactorySummary(plot);

            return (
              <div
                key={plot.id || idx}
                className="bg-[#18181b] hover:bg-zinc-800/70 p-4 sm:p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-3 transition-colors border-none"
              >
                {/* 1. Plot Header: Name + Areas + Unlocked Badge */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-white text-sm truncate">
                      {formatPlotName(plot.name || '', language)}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                      {plot.name} • {areas.length} {isEs ? 'áreas' : 'areas'}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 shrink-0 flex items-center gap-1">
                    <CheckCircleBold className="w-3 h-3 shrink-0" />
                    <span>{isEs ? 'Desbloqueada' : 'Unlocked'}</span>
                  </span>
                </div>

                {/* 2. Blueprint Strip (If applied) */}
                {plot.appliedBlueprint && (
                  <div className="bg-zinc-800/60 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs shadow-inner">
                    <span className="text-zinc-400 text-[10px] flex items-center gap-1.5 font-medium">
                      <DocumentTextBoldDuotone size={13} className="text-amber-400" />
                      <span>{isEs ? 'Plano aplicado:' : 'Blueprint:'}</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-[11px] flex items-center gap-1">
                      <span>{plot.appliedBlueprint.definitionId?.replace('_BLUEPRINT', '')}</span>
                      <span className="flex items-center text-amber-400">
                        ({plot.appliedBlueprint.starLevel}
                        <StarBold className="w-2.5 h-2.5 text-amber-400 shrink-0 ml-0.5" />)
                      </span>
                    </span>
                  </div>
                )}

                {/* 3. Installed Factories Chips */}
                <div className="pt-0.5 space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block">
                    {isEs ? 'Fábricas instaladas:' : 'Installed factories:'}{' '}
                    <span className="text-zinc-200 font-mono">({allPlotFactories.length})</span>
                  </span>

                  {Object.keys(factoryCounts).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(factoryCounts).map(([symbol, count]) => (
                        <span
                          key={symbol}
                          className="bg-zinc-800/60 px-2 py-1 rounded-xl text-[11px] text-zinc-200 font-medium flex items-center gap-1.5 shadow-inner"
                        >
                          <FactoryIcon symbol={symbol} size={14} />
                          <span className="truncate max-w-[100px]">{formatFactoryName(symbol, language)}</span>
                          <span className="text-amber-400 font-mono font-black">x{count}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-500 italic block">
                      {isEs ? 'Sin fábricas instaladas' : 'No installed factories'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-zinc-400 text-center py-6">
          {isEs
            ? 'No se encontraron parcelas asociadas a la cuenta.'
            : 'No land plots found for this account.'}
        </p>
      )}
    </div>
  );
};
