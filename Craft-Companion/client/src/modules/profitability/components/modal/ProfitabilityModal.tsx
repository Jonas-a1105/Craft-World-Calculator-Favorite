import React from 'react';
import { createPortal } from 'react-dom';
import type {
  FactorySummary,
  AdjustedCycleResult,
  ModalViewTab,
  FilterMode,
  InputSupplyMode,
} from '../../types';
import type { ValueChainAnalysis } from '../../../../services/valueChainCalculator';
import { useTranslation } from '../../../../utils/i18n';
import { ModalHeader } from './ModalHeader';
import { ModalTabsNav } from './ModalTabsNav';
import { LevelsBreakdownView } from './LevelsBreakdownView';
import { ValueChainStepView } from './ValueChainStepView';

export interface ProfitabilityModalProps {
  summary: FactorySummary | undefined;
  cycleResults: AdjustedCycleResult[];
  chainAnalysis: ValueChainAnalysis | null;
  modalViewTab: ModalViewTab;
  setModalViewTab: (tab: ModalViewTab) => void;
  modalLevelFilter: FilterMode;
  setModalLevelFilter: (filter: FilterMode) => void;
  inputSupplyMode: InputSupplyMode;
  onClose: () => void;
}

export const ProfitabilityModal: React.FC<ProfitabilityModalProps> = ({
  summary,
  cycleResults,
  chainAnalysis,
  modalViewTab,
  setModalViewTab,
  modalLevelFilter,
  setModalLevelFilter,
  inputSupplyMode,
  onClose,
}) => {
  const { language } = useTranslation();

  if (!summary) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#18181b] rounded-[32px] p-6 sm:p-7 space-y-5 max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <ModalHeader summary={summary} onClose={onClose} />

        {/* Modal View Selector */}
        <ModalTabsNav
          modalViewTab={modalViewTab}
          setModalViewTab={setModalViewTab}
        />

        {/* Content View */}
        {modalViewTab === 'levels' ? (
          <LevelsBreakdownView
            summary={summary}
            cycleResults={cycleResults}
            modalLevelFilter={modalLevelFilter}
            setModalLevelFilter={setModalLevelFilter}
            inputSupplyMode={inputSupplyMode}
          />
        ) : (
          <ValueChainStepView summary={summary} analysis={chainAnalysis} />
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 flex-shrink-0">
          <span className="text-xs text-zinc-400 font-medium">
            {modalViewTab === 'levels'
              ? `${cycleResults.length} ${language === 'es' ? 'niveles mostrados' : 'levels displayed'}`
              : `${chainAnalysis?.steps.length || 0} ${language === 'es' ? 'pasos en la cadena' : 'chain steps'}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm cursor-pointer transition-colors shadow-md"
          >
            {language === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
