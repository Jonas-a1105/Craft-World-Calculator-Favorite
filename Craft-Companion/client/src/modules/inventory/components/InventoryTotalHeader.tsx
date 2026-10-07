import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';

interface InventoryTotalHeaderProps {
  totalValue: number;
  resourceCount: number;
  language: string;
}

export const InventoryTotalHeader: React.FC<InventoryTotalHeaderProps> = ({
  totalValue,
  resourceCount,
  language,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-4 space-y-2">
      <div className="flex items-center gap-2.5">
        <ResourceIcon symbol="Coin" size={30} />
        <span className="text-base sm:text-lg text-slate-300 font-semibold tracking-wide">
          {language === 'es' ? 'Valor total estimado' : 'Total estimated value'}
        </span>
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-normal text-amber-400 font-title tracking-tight py-2 select-none">
        {formatNumber(totalValue)}{' '}
        <span className="text-base sm:text-lg md:text-xl font-normal text-amber-500 ml-2">
          COIN
        </span>
      </div>
      <div className="pt-0.5">
        <span className="bg-[#202024] px-3.5 py-1 rounded-full text-slate-300 font-bold text-xs">
          {resourceCount}{' '}
          {language === 'es' ? 'recursos distintos' : 'distinct resources'}
        </span>
      </div>
    </div>
  );
};
