import React from 'react';
import type { PowerBracketStep } from '../types';

interface PowerBracketSteppedBarProps {
  brackets: PowerBracketStep[];
  selectedIndex: number;
  multiplier?: number;
  onSelectIndex: (index: number) => void;
  language: string;
}

function formatPowerNumber(val: number): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (val >= 1_000) {
    const k = val / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return val.toLocaleString();
}

export const PowerBracketSteppedBar: React.FC<PowerBracketSteppedBarProps> = ({
  brackets,
  selectedIndex,
  multiplier = 1,
  onSelectIndex,
  language,
}) => {
  const isEs = language === 'es';

  if (!brackets || brackets.length === 0) return null;

  return (
    <div className="w-full pt-1 pb-0.5 space-y-1.5 select-none">
      {/* Label and current tier info */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1 font-semibold text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
          {isEs ? 'Escalado de Energía' : 'Power Escalation'}
        </span>
        <span className="text-[10px] text-amber-300/90 font-bold">
          {isEs ? 'Tramo' : 'Tier'} {selectedIndex + 1}/{brackets.length}
        </span>
      </div>

      {/* Stepped Segments Grid */}
      <div
        className="grid gap-1 items-center"
        style={{ gridTemplateColumns: `repeat(${brackets.length}, minmax(0, 1fr))` }}
      >
        {brackets.map((bracket, idx) => {
          const isSelected = idx === selectedIndex;
          const isFilled = idx <= selectedIndex;
          const displayPower = formatPowerNumber(bracket.power * multiplier);
          const limitLabel = bracket.batchLimit === '∞' ? '∞' : bracket.batchLimit.toString();

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              title={`${isEs ? 'Hasta' : 'Up to'} ${limitLabel} (${displayPower} Power)`}
              className={`group flex flex-col items-center justify-between p-1 rounded-xl transition-all border-none outline-none cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 shadow-sm shadow-amber-500/20'
                  : 'bg-[#15151a] hover:bg-[#202028]'
              }`}
            >
              {/* Top: Batch Limit */}
              <span
                className={`text-[9.5px] font-mono leading-none mb-1 transition-colors ${
                  isSelected
                    ? 'text-amber-300 font-bold'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {limitLabel}
              </span>

              {/* Middle: Stepped Indicator Bar Segment */}
              <div className="w-full h-1.5 rounded-full bg-[#24242c] overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'w-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-sm shadow-amber-400/50'
                      : isFilled
                        ? 'w-full bg-amber-500/60'
                        : 'w-0 bg-transparent'
                  }`}
                />
              </div>

              {/* Bottom: Power Value */}
              <span
                className={`text-[9px] font-mono leading-none mt-1 transition-colors ${
                  isSelected
                    ? 'text-white font-bold'
                    : 'text-slate-400 group-hover:text-slate-300 font-medium'
                }`}
              >
                {displayPower}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
