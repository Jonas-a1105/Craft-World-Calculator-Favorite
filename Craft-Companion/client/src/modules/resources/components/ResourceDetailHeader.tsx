import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';

interface ResourceDetailHeaderProps {
  symbol: string;
  language: string;
  onBack: () => void;
}

export const ResourceDetailHeader: React.FC<ResourceDetailHeaderProps> = ({
  symbol,
  language,
  onBack,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#151518] flex items-center justify-center shrink-0 shadow-md">
          <ResourceIcon symbol={symbol} size={26} />
        </div>
        <div>
          <h1 className="font-title text-base sm:text-lg text-white font-bold tracking-wider leading-tight">
            {symbol}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
            {language === 'es' ? 'Cotización y actividad' : 'Price quote & activity'}
          </p>
        </div>
      </div>

      {/* Close / Return Button */}
      <button
        type="button"
        onClick={onBack}
        title={language === 'es' ? 'Volver' : 'Back'}
        style={{ padding: 0 }}
        className="w-10 h-10 rounded-full bg-[#202024] hover:bg-rose-500/20 active:scale-95 text-slate-300 hover:text-rose-400 flex items-center justify-center font-bold text-sm transition-all border-none shadow-md !p-0 shrink-0"
      >
        ✕
      </button>
    </div>
  );
};
