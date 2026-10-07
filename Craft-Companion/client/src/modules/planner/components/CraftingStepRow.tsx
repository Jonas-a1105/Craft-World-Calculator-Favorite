import React from 'react';
import { CraftingStep } from '../types';
import { FactoryIcon, ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import { formatDurationFromMinutes } from '../../../services/durationFormat';

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
  return (
    <div className="p-5 rounded-[24px] bg-[#141416] hover:bg-[#18181c] transition-all space-y-4 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Step Number + Factory + Output */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
            #{index + 1}
          </div>
          <div className="flex items-center gap-2.5">
            <FactoryIcon symbol={step.factoryName} size={30} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  {step.factoryName}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#202024] text-zinc-300">
                  {step.cyclesNeeded}{' '}
                  {step.cyclesNeeded === 1
                    ? language === 'es'
                      ? 'ciclo'
                      : 'cycle'
                    : language === 'es'
                      ? 'ciclos'
                      : 'cycles'}
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {language === 'es' ? 'Produce' : 'Produces'}:{' '}
                <strong className="text-white font-mono">
                  {formatNumber(step.outputAmount)} {step.outputToken}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Production Duration */}
        <div className="flex items-center gap-2 bg-[#1b1b1f] px-3.5 py-1.5 rounded-full text-xs text-zinc-300 self-start sm:self-auto">
          <svg
            className="w-3.5 h-3.5 text-sky-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-mono font-bold text-white">
            {formatDurationFromMinutes(step.totalTimeMin)}
          </span>
        </div>
      </div>

      {/* Inputs needed for this step */}
      {step.inputs.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-bold uppercase text-[10px]">
            {language === 'es' ? 'Consume:' : 'Requires:'}
          </span>
          {step.inputs.map((inp) => (
            <div
              key={inp.token}
              className="flex items-center gap-1.5 bg-[#1b1b1f] px-2.5 py-1 rounded-full text-zinc-300"
            >
              <ResourceIcon symbol={inp.token} size={16} />
              <span className="font-mono font-bold text-white">
                {formatNumber(inp.amount)}
              </span>
              <span className="text-zinc-400">{inp.token}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
