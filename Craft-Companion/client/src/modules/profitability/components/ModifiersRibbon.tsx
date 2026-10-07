import React from 'react';
import type { InputSupplyMode } from '../types';
import { useTranslation } from '../../../utils/i18n';

export interface ModifiersRibbonProps {
  inputSupplyMode: InputSupplyMode;
  setInputSupplyMode: (mode: InputSupplyMode) => void;
  useWorkshop: boolean;
  setUseWorkshop: (val: boolean) => void;
  useMastery: boolean;
  setUseMastery: (val: boolean) => void;
  useBoosters: boolean;
  setUseBoosters: (val: boolean) => void;
}

export const ModifiersRibbon: React.FC<ModifiersRibbonProps> = ({
  inputSupplyMode,
  setInputSupplyMode,
  useWorkshop,
  setUseWorkshop,
  useMastery,
  setUseMastery,
  useBoosters,
  setUseBoosters,
}) => {
  const { language } = useTranslation();

  return (
    <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 shadow-xl border-none space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <svg
          className="w-4 h-4 text-emerald-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        <h3 className="font-title text-[11px] sm:text-xs md:text-sm text-white tracking-wide uppercase truncate">
          {language === 'es'
            ? 'Modificadores & Abastecimiento'
            : 'Modifiers & Supply Mode'}
        </h3>
      </div>

      <div className="space-y-3.5">
        {/* Input Supply Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-3 sm:p-3.5 bg-[#141416] rounded-2xl border-none">
          <span className="font-bold text-zinc-300 text-xs flex items-center gap-2 flex-shrink-0">
            <svg
              className="w-4 h-4 text-zinc-400 flex-shrink-0"
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
            {language === 'es' ? 'Origen de Insumos:' : 'Input Origin:'}
          </span>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setInputSupplyMode('market')}
              className={`px-3 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                inputSupplyMode === 'market'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'bg-[#202024] text-zinc-400 hover:text-white hover:bg-[#28282e]'
              }`}
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="truncate">
                {language === 'es' ? 'Mercado' : 'Market'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setInputSupplyMode('self_crafted')}
              className={`px-3 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                inputSupplyMode === 'self_crafted'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-[#202024] text-zinc-400 hover:text-white hover:bg-[#28282e]'
              }`}
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
                />
              </svg>
              <span className="truncate">
                {language === 'es' ? 'Auto-Producido' : 'Self-Crafted'}
              </span>
            </button>
          </div>
        </div>

        {/* Account Modifiers */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
            <label className="flex items-center gap-2 cursor-pointer bg-[#141416] hover:bg-[#202026] px-3.5 py-2 rounded-full transition-colors">
              <input
                type="checkbox"
                checked={useWorkshop}
                onChange={(e) => setUseWorkshop(e.target.checked)}
                className="accent-emerald-500 flex-shrink-0"
              />
              <span className="font-bold text-white flex items-center gap-1.5 truncate">
                <svg
                  className="w-3.5 h-3.5 text-amber-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="truncate">
                  {language === 'es' ? 'Taller' : 'Workshop'}
                </span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#141416] hover:bg-[#202026] px-3.5 py-2 rounded-full transition-colors">
              <input
                type="checkbox"
                checked={useMastery}
                onChange={(e) => setUseMastery(e.target.checked)}
                className="accent-emerald-500 flex-shrink-0"
              />
              <span className="font-bold text-white flex items-center gap-1.5 truncate">
                <svg
                  className="w-3.5 h-3.5 text-sky-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5"
                  />
                </svg>
                <span className="truncate">
                  {language === 'es' ? 'Maestría' : 'Mastery'}
                </span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#141416] hover:bg-[#202026] px-3.5 py-2 rounded-full transition-colors">
              <input
                type="checkbox"
                checked={useBoosters}
                onChange={(e) => setUseBoosters(e.target.checked)}
                className="accent-emerald-500 flex-shrink-0"
              />
              <span className="font-bold text-white flex items-center gap-1.5 truncate">
                <svg
                  className="w-3.5 h-3.5 text-rose-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
                <span className="truncate">
                  {language === 'es' ? 'Boosters x2' : 'Boosters x2'}
                </span>
              </span>
            </label>
          </div>

          <div className="text-zinc-400 font-bold text-[11px] flex items-center">
            {useWorkshop && useMastery && useBoosters ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full w-full sm:w-auto justify-center">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  {language === 'es'
                    ? 'Con Boosts de Cuenta'
                    : 'Full Account Boosted'}
                </span>
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full w-full sm:w-auto justify-center">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>
                  {language === 'es' ? 'Máquina Base' : 'Base Machine'}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
