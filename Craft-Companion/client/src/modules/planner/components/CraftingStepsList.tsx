import React from 'react';
import { CraftingStep } from '../types';
import { CraftingStepRow } from './CraftingStepRow';

export interface CraftingStepsListProps {
  craftingSteps: CraftingStep[];
  language: 'es' | 'en';
}

export const CraftingStepsList: React.FC<CraftingStepsListProps> = ({
  craftingSteps,
  language,
}) => {
  return (
    <div className="space-y-4">
      {/* Information Helper Callout */}
      <div className="text-xs text-zinc-400 bg-[#141416] p-3.5 rounded-[20px] flex items-center gap-2">
        <svg
          className="w-4 h-4 text-sky-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          {language === 'es'
            ? 'Lista de pasos de fabricación e insumos intermedios en orden de preparación.'
            : 'List of crafting stages and intermediate recipes ordered by dependency.'}
        </span>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {craftingSteps.map((step, idx) => (
          <CraftingStepRow
            key={`${step.outputToken}-${idx}`}
            step={step}
            index={idx}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};
