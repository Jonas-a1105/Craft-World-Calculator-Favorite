import React from 'react';
import type { CraftingStep } from '../types';
import { FactoryIcon, ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import { formatDurationFromMinutes } from '../../../services/durationFormat';
import { StopwatchBoldDuotone } from 'solar-icon-set';

export interface CraftingStepRowProps {
  step: CraftingStep;
  index: number;
  language: 'es' | 'en';
}

export const CraftingStepRow: React.FC<CraftingStepRowProps> = ({
  step,
  index,
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="rounded-[32px] bg-[#18181b] hover:bg-[#1c1c20] p-5 shadow-xl transition-all duration-200 border-none select-none space-y-3.5">
      {/* 1. Header of Step: Step Number + Factory Name + Cycles + Estimated Duration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 text-xs font-black flex items-center justify-center shrink-0 shadow-inner">
            #{index + 1}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800/50 flex items-center justify-center shrink-0">
              <FactoryIcon symbol={step.factoryName} size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  {step.factoryName}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  {step.cyclesNeeded}{' '}
                  {step.cyclesNeeded === 1
                    ? isEs
                      ? 'ciclo'
                      : 'cycle'
                    : isEs
                      ? 'ciclos'
                      : 'cycles'}
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {isEs ? 'Producción:' : 'Output:'}{' '}
                <strong className="text-emerald-400 font-mono font-extrabold">
                  {formatNumber(step.outputAmount)} {step.outputToken}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Duration Badge */}
        <div className="flex items-center gap-2 bg-zinc-800/50 px-3.5 py-1.5 rounded-full text-xs text-zinc-300 self-start sm:self-auto">
          <StopwatchBoldDuotone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono font-bold text-white">
            {formatDurationFromMinutes(step.totalTimeMin)}
          </span>
        </div>
      </div>

      {/* 2. Inputs Required for this Step */}
      {step.inputs.length > 0 && (
        <div className="bg-zinc-800/50 rounded-2xl p-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">
            {isEs ? 'Consume:' : 'Requires:'}
          </span>
          {step.inputs.map((inp) => (
            <div
              key={inp.token}
              className="flex items-center gap-1.5 bg-zinc-900/60 px-3 py-1.5 rounded-xl text-zinc-300 font-medium"
            >
              <ResourceIcon symbol={inp.token} size={16} />
              <span className="font-mono font-extrabold text-white">
                {formatNumber(inp.amount)}
              </span>
              <span className="text-zinc-400 font-semibold">{inp.token}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
