import React from 'react';
import { CraftingStep } from '../types';
import { CraftingStepRow } from './CraftingStepRow';
import { CheckCircleBold } from 'solar-icon-set';

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
      <div className="text-xs text-zinc-300 bg-[#18181b] border border-zinc-800/80 p-3.5 rounded-2xl flex items-center gap-2.5 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
        <span className="font-medium">
          {language === 'es'
            ? 'Secuencia de ensamblaje ordenada por jerarquía de dependencias e insumos.'
            : 'Assembly sequence organized by dependency tree and intermediate recipes.'}
        </span>
      </div>

      {/* Steps List */}
      {craftingSteps.length === 0 ? (
        <div className="rounded-[32px] bg-[#18181b] border border-zinc-800/80 p-12 text-center text-zinc-500 space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircleBold className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-zinc-200">
              {language === 'es'
                ? 'Sin etapas de manufactura'
                : 'No Crafting Stages Needed'}
            </p>
            <p className="text-xs text-zinc-400">
              {language === 'es'
                ? 'Este recurso es un elemento básico o primario que no requiere procesamiento en fábricas.'
                : 'This resource is a primary element and requires no factory processing.'}
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};
