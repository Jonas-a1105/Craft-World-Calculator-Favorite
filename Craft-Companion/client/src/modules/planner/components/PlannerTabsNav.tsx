import React from 'react';
import type { PlannerViewTab, MaterialFilter, PlannerKpiStats } from '../types';
import { useTranslation } from '../../../utils/i18n';

export interface PlannerTabsNavProps {
  viewTab: PlannerViewTab;
  setViewTab: (tab: PlannerViewTab) => void;
  materialFilter: MaterialFilter;
  setMaterialFilter: (filter: MaterialFilter) => void;
  kpiStats: PlannerKpiStats;
  craftingStepsCount: number;
  copiedNotification: boolean;
  onCopyMissing: () => void;
}

export const PlannerTabsNav: React.FC<PlannerTabsNavProps> = ({
  viewTab,
  setViewTab,
  materialFilter,
  setMaterialFilter,
  kpiStats,
  craftingStepsCount,
  copiedNotification,
  onCopyMissing,
}) => {
  const { language } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-white/[0.06] pb-4">
      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1.5 bg-[#141416] p-1 rounded-full w-full md:w-auto">
        <button
          type="button"
          onClick={() => setViewTab('materials')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
            viewTab === 'materials'
              ? 'bg-sky-500 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span>
            {language === 'es' ? 'Materias Primas' : 'Raw Materials'} (
            {kpiStats.totalTypes})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab('steps')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
            viewTab === 'steps'
              ? 'bg-sky-500 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>
            {language === 'es' ? 'Pasos de Fabricación' : 'Crafting Steps'} (
            {craftingStepsCount})
          </span>
        </button>
      </div>

      {/* Utility Actions (Filters + Copy Button) */}
      {viewTab === 'materials' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full md:w-auto">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-full text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setMaterialFilter('all')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer border-none ${
                materialFilter === 'all'
                  ? 'bg-[#202024] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {language === 'es' ? 'Todos' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setMaterialFilter('missing')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer border-none ${
                materialFilter === 'missing'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              {language === 'es' ? 'Faltantes' : 'Missing'} (
              {kpiStats.missingTypes})
            </button>
            <button
              type="button"
              onClick={() => setMaterialFilter('ready')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer border-none ${
                materialFilter === 'ready'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              {language === 'es' ? 'Listos' : 'Ready'} ({kpiStats.readyTypes})
            </button>
          </div>

          {/* Copy Button */}
          <div className="flex justify-end w-full sm:w-auto">
            <button
              type="button"
              onClick={onCopyMissing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#141416] hover:bg-[#202024] text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5 text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="whitespace-nowrap">
                {copiedNotification
                  ? language === 'es'
                    ? '¡Copiado!'
                    : 'Copied!'
                  : language === 'es'
                    ? 'Copiar faltantes'
                    : 'Copy missing'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
