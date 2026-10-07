import React from 'react';
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
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
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
        <svg
          className="w-3.5 h-3.5"
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
          {language === 'es' ? 'Cadena Paso a Paso' : 'Step-by-Step Chain'}
        </span>
      </button>
    </div>
  );
};
