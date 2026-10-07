import React from 'react';
import { ListBold, BoltBold } from 'solar-icon-set';
import type { ModalViewTab } from '../../types';
import { useTranslation } from '../../../../utils/i18n';

export interface ModalTabsNavProps {
  modalViewTab: ModalViewTab;
  setModalViewTab: (tab: ModalViewTab) => void;
}

export const ModalTabsNav: React.FC<ModalTabsNavProps> = ({
  modalViewTab,
  setModalViewTab,
}) => {
  const { language } = useTranslation();

  return (
    <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 flex-shrink-0">
      <button
        type="button"
        onClick={() => setModalViewTab('levels')}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          modalViewTab === 'levels'
            ? 'bg-white text-zinc-950 shadow-md font-bold'
            : 'bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <ListBold className="w-3.5 h-3.5 shrink-0" />
        <span>
          {language === 'es'
            ? 'Desglose de Niveles (1 al 40)'
            : 'Level Breakdown (1 to 40)'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setModalViewTab('chain')}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
          modalViewTab === 'chain'
            ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
            : 'bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <BoltBold className="w-3.5 h-3.5 shrink-0" />
        <span>
          {language === 'es' ? 'Cadena Paso a Paso' : 'Step-by-Step Chain'}
        </span>
      </button>
    </div>
  );
};
