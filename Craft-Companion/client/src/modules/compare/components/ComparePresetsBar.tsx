import React from 'react';

export interface ComparePresetsBarProps {
  onCompareNextLevel: () => void;
  onCompareMaxLevel: () => void;
  onSwap: () => void;
  language: 'es' | 'en';
}

export const ComparePresetsBar: React.FC<ComparePresetsBarProps> = ({
  onCompareNextLevel,
  onCompareMaxLevel,
  onSwap,
  language,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-2">
      <button
        type="button"
        onClick={onCompareNextLevel}
        className="px-3.5 py-1.5 rounded-full bg-[#18181b] hover:bg-[#222226] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer border-none shadow-md flex items-center gap-1.5"
      >
        <svg
          className="w-3.5 h-3.5 text-sky-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
        <span>
          {language === 'es'
            ? 'Comparar Nivel Siguiente (+1)'
            : 'Compare Next Level (+1)'}
        </span>
      </button>

      <button
        type="button"
        onClick={onCompareMaxLevel}
        className="px-3.5 py-1.5 rounded-full bg-[#18181b] hover:bg-[#222226] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer border-none shadow-md flex items-center gap-1.5"
      >
        <svg
          className="w-3.5 h-3.5 text-amber-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 11l7-7 7 7M5 19l7-7 7 7"
          />
        </svg>
        <span>
          {language === 'es'
            ? 'Comparar con Nivel Máximo (40)'
            : 'Compare with Max Level (40)'}
        </span>
      </button>

      <button
        type="button"
        onClick={onSwap}
        className="px-3.5 py-1.5 rounded-full bg-[#18181b] hover:bg-[#222226] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer border-none shadow-md flex items-center gap-1.5"
      >
        <svg
          className="w-3.5 h-3.5 text-emerald-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <span>{language === 'es' ? 'Invertir A ⇄ B' : 'Swap A ⇄ B'}</span>
      </button>
    </div>
  );
};
