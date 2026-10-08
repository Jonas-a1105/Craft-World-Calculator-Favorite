import React from 'react';
import type { FactorySummary, SimulationMode } from '../../types';
import { useTranslation } from '../../../../utils/i18n';
import { FactoryIcon } from '../../../../components/GameIcon';
import { CloseCircleLinear } from 'solar-icon-set';

export interface ModalHeaderProps {
  summary: FactorySummary;
  simulationMode?: SimulationMode;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ summary, simulationMode, onClose }) => {
  const { language } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-4 flex-shrink-0 pb-1">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-black/60 ring-2 ring-white/10 flex items-center justify-center flex-shrink-0">
          <FactoryIcon symbol={summary.token} size={42} />
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-[#18181b] ${
              summary.ownedLevel ? 'bg-emerald-400' : 'bg-zinc-600'
            }`}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate">
              {summary.token}
            </h2>
            {summary.ownedLevel && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                {language === 'es'
                  ? `Posees Nivel ${summary.ownedLevel}`
                  : `Owned Level ${summary.ownedLevel}`}
              </span>
            )}
            {simulationMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-zinc-300 border border-white/10 flex-shrink-0">
                {simulationMode === 'base'
                  ? language === 'es'
                    ? '🏛️ Modo Base'
                    : '🏛️ Base Mode'
                  : simulationMode === 'active_owned'
                    ? language === 'es'
                      ? '🚜 En Vivo (Parcela)'
                      : '🚜 Live Plot'
                    : language === 'es'
                      ? '🚀 Con Bonos'
                      : '🚀 Projected'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {language === 'es'
              ? 'Desglose financiero nivel por nivel (1 al 40) con costos y márgenes en tiempo real.'
              : 'Complete level-by-level financial breakdown (Levels 1 to 40) with real-time costs.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
        title={language === 'es' ? 'Cerrar' : 'Close'}
      >
        <CloseCircleLinear className="w-5 h-5" />
      </button>
    </div>
  );
};
