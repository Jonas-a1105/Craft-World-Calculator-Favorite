import React from 'react';
import type { EfficiencyItem } from '../types';
import { EfficiencyCard } from './EfficiencyCard';

interface EfficiencyCardsGridProps {
  items: EfficiencyItem[];
  onMultiplierChange: (symbol: string, mult: number) => void;
  onUnitsChange?: (symbol: string, units: number) => void;
  onBracketChange?: (symbol: string, bracketIdx: number) => void;
  baseSymbol: string;
  language: string;
}

export const EfficiencyCardsGrid: React.FC<EfficiencyCardsGridProps> = ({
  items,
  onMultiplierChange,
  onUnitsChange,
  onBracketChange,
  baseSymbol,
  language,
}) => {
  const isEs = language === 'es';

  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#151518]">
        <p className="text-xs font-mono text-slate-400">
          {isEs
            ? 'No se encontraron recursos que coincidan con la búsqueda.'
            : 'No resources found matching the search criteria.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <EfficiencyCard
          key={item.symbol}
          item={item}
          onMultiplierChange={onMultiplierChange}
          onUnitsChange={onUnitsChange}
          onBracketChange={onBracketChange}
          baseSymbol={baseSymbol}
          language={language}
        />
      ))}
    </div>
  );
};
