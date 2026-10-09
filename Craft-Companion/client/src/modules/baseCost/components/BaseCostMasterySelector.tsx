import React from 'react';
import { MASTERY_MULTIPLIERS } from '../data/baseCostCatalog';

interface BaseCostMasterySelectorProps {
  token: string;
  mastery: number;
  onMasteryChange: (token: string, mastery: number) => void;
}

export const BaseCostMasterySelector: React.FC<BaseCostMasterySelectorProps> = ({
  token,
  mastery,
  onMasteryChange,
}) => {
  const mult = MASTERY_MULTIPLIERS[mastery] ?? 1;
  const bonusPct = ((mult - 1) * 100).toFixed(2);

  return (
    <select
      value={mastery}
      onChange={(e) => onMasteryChange(token, Number(e.target.value))}
      title={`Maestría ${mastery} (${bonusPct}% bono de reducción)`}
      className={`w-11 bg-[#131316] border-none ring-1 rounded-md px-1 py-0.5 text-xs font-mono text-center cursor-pointer transition-all focus:outline-none ${
        mastery > 0
          ? 'ring-amber-400/50 text-amber-300 font-semibold bg-[#222228]'
          : 'ring-white/10 text-slate-400 hover:text-slate-200'
      }`}
    >
      {Array.from({ length: 11 }, (_, i) => (
        <option key={i} value={i} className="bg-[#18181c] text-slate-200">
          {i}
        </option>
      ))}
    </select>
  );
};
