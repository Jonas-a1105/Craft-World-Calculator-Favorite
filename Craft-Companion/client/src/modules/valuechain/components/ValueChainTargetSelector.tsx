import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { FEATURED_TARGETS } from '../services/valueChainService';

interface ValueChainTargetSelectorProps {
  selectedToken: string;
  onSelectToken: (token: string) => void;
  language: string;
}

export const ValueChainTargetSelector: React.FC<ValueChainTargetSelectorProps> = ({
  selectedToken,
  onSelectToken,
  language,
}) => {
  return (
    <div className="bg-[#1c1c20] p-4 rounded-3xl border-none">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        {language === 'es'
          ? 'Selecciona el Producto Terminado a Simular:'
          : 'Select Finished Product to Simulate:'}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
        {FEATURED_TARGETS.map((t) => {
          const isSelected = selectedToken === t.token;
          return (
            <button
              key={t.token}
              type="button"
              onClick={() => onSelectToken(t.token)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-none transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/80 to-[#151518] text-white shadow-xl scale-105'
                  : 'bg-[#151518] text-slate-400 hover:bg-[#202024] hover:text-slate-200'
              }`}
            >
              <ResourceIcon symbol={t.token} className="w-8 h-8 mb-1.5 drop-shadow-md" />
              <span className="text-xs font-black tracking-tight">{t.token}</span>
              <span className="text-[10px] opacity-75 font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
