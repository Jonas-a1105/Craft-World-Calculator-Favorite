import React from 'react';
import type {
  FactorySummary,
  AdjustedCycleResult,
  FilterMode,
  InputSupplyMode,
} from '../../types';
import { useTranslation } from '../../../../utils/i18n';
import { LevelCardRow } from './LevelCardRow';

export interface LevelsBreakdownViewProps {
  summary: FactorySummary;
  cycleResults: AdjustedCycleResult[];
  modalLevelFilter: FilterMode;
  setModalLevelFilter: (filter: FilterMode) => void;
  inputSupplyMode: InputSupplyMode;
}

export const LevelsBreakdownView: React.FC<LevelsBreakdownViewProps> = ({
  summary,
  cycleResults,
  modalLevelFilter,
  setModalLevelFilter,
  inputSupplyMode,
}) => {
  const { language } = useTranslation();

  const filterTabs = [
    {
      id: 'all',
      label:
        language === 'es' ? 'Todos los Niveles (40)' : 'All Levels (40)',
    },
    ...(summary.ownedLevel
      ? [
          {
            id: 'owned',
            label:
              language === 'es'
                ? `Tu Nivel (Nv. ${summary.ownedLevel})`
                : `Your Level (Lv. ${summary.ownedLevel})`,
          },
        ]
      : []),
    { id: 'profitable', label: language === 'es' ? 'En Ganancia' : 'Profitable' },
    { id: 'loss', label: language === 'es' ? 'En Pérdida' : 'In Loss' },
  ];

  return (
    <>
      {/* Sub-header Filter Tabs & Input Mode Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 flex-shrink-0">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setModalLevelFilter(tab.id as FilterMode)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                modalLevelFilter === tab.id
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'bg-[#24242a] text-zinc-300 hover:text-white hover:bg-[#2e2e36]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Mode Badge */}
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>
            {inputSupplyMode === 'self_crafted'
              ? language === 'es'
                ? 'Insumos Auto-Producidos'
                : 'Self-Crafted Inputs'
              : language === 'es'
                ? 'Insumos de Mercado'
                : 'Market Inputs'}
          </span>
        </div>
      </div>

      {/* Modal Level Cards List */}
      <div className="flex-1 overflow-y-auto min-h-0 modal-custom-scroll pr-1.5 -mr-1 space-y-2.5">
        {cycleResults.map((c) => (
          <LevelCardRow
            key={c.row.level}
            cycle={c}
            isOwnedLevel={summary.ownedLevel === c.row.level}
            inputSupplyMode={inputSupplyMode}
          />
        ))}
      </div>
    </>
  );
};
