import React from 'react';
import { LevelProgression, TableViewMode } from '../types';
import { ProgressionTableRow } from './ProgressionTableRow';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  levels: LevelProgression[];
  viewMode: TableViewMode;
  onViewModeChange: (mode: TableViewMode) => void;
}

export const ProgressionTable: React.FC<Props> = ({
  levels,
  viewMode,
  onViewModeChange,
}) => {
  const { language } = useTranslation();

  return (
    <div className="space-y-3 mb-10 w-full min-w-0 max-w-full">
      {/* Table controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full min-w-0">
        {/* Toggle pill buttons */}
        <div className="inline-flex items-center bg-[#18181c] p-1 rounded-full border-none shadow-md shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onViewModeChange('essential')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border-none transition-all duration-150 select-none ${
              viewMode === 'essential'
                ? 'bg-indigo-600/40 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'es' ? 'Esencial' : 'Essential'}
          </button>
          <button
            onClick={() => onViewModeChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border-none transition-all duration-150 select-none ${
              viewMode === 'all'
                ? 'bg-indigo-600/40 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'es' ? 'Todas las columnas' : 'All columns'}
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 select-none font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0"></span>
          <span className="text-emerald-400">
            {language === 'es'
              ? 'verde - cambio vs nivel anterior'
              : 'green - change vs previous level'}
          </span>
        </div>
      </div>

      {/* Table container: completely rounded, no borders, soft background */}
      <div className="w-full max-w-full overflow-x-auto rounded-[24px] sm:rounded-[28px] bg-[#18181c] shadow-2xl border-none">
        <table className="w-full min-w-[540px] text-left border-collapse border-none">
          <thead className="bg-white/[0.02] border-none text-[11px] uppercase tracking-wider text-slate-400 font-main">
            <tr>
              <th className="px-3.5 sm:px-4 py-3 font-bold border-none">LV</th>
              <th className="px-3.5 sm:px-4 py-3 font-bold border-none">
                {language === 'es' ? 'COSTE MEJORA' : 'UPGRADE COST'}
              </th>
              <th className="px-3.5 sm:px-4 py-3 font-bold border-none">
                {language === 'es' ? 'DURACIÓN' : 'DURATION'}
              </th>
              <th className="px-3.5 sm:px-4 py-3 font-bold border-none">
                {language === 'es' ? 'PRODUCCIÓN' : 'OUTPUT'}
              </th>
              <th className="px-3.5 sm:px-4 py-3 font-bold border-none">
                {language === 'es' ? 'ENERGÍA' : 'POWER'}
              </th>
              <th className="px-3.5 sm:px-4 py-3 font-bold border-none">
                {language === 'es' ? 'PROD / DÍA' : 'PROD/DAY'}
              </th>
              {viewMode === 'all' && (
                <th className="px-3.5 sm:px-4 py-3 font-bold border-none">
                  {language === 'es' ? 'ENTRADAS' : 'INPUTS'}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02] border-none">
            {levels.map((row) => (
              <ProgressionTableRow key={row.level} row={row} viewMode={viewMode} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom footnote */}
      <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono px-2 select-none">
        {language === 'es'
          ? 'Las filas resaltadas indican los niveles donde el coste de mejora cambia a un nuevo recurso.'
          : 'Highlighted rows mark levels where the upgrade cost switches to a new resource.'}
      </p>
    </div>
  );
};
