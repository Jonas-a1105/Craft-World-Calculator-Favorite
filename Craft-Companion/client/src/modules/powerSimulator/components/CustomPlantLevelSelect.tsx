import React, { useState, useRef, useEffect } from 'react';
import { AltArrowDownLinear } from 'solar-icon-set';
import type { PassivePlantLevel } from '../types';

interface CustomPlantLevelSelectProps {
  levels: PassivePlantLevel[];
  currentLevel: number;
  onChange: (level: number) => void;
  language: string;
}

export const CustomPlantLevelSelect: React.FC<CustomPlantLevelSelectProps> = ({
  levels,
  currentLevel,
  onChange,
  language,
}) => {
  const isEs = language === 'es';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll to active option when opening
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeOption = listRef.current.querySelector<HTMLButtonElement>(
        '[data-selected="true"]',
      );
      if (activeOption) {
        activeOption.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const activeLevelData = levels.find((l) => l.level === currentLevel);

  return (
    <div ref={containerRef} className="relative w-full min-w-0 select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#131316] hover:bg-[#1a1a20] active:bg-[#202028] transition-all border-none outline-none cursor-pointer shadow-inner"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 font-mono text-xs">
          {currentLevel === 0 ? (
            <span className="text-slate-400 font-medium truncate">
              — {isEs ? 'No adquirida' : 'Not owned'} —
            </span>
          ) : (
            <div className="flex items-baseline gap-2 truncate">
              <span className="font-bold text-white shrink-0">
                {isEs ? 'Nivel' : 'Level'} {currentLevel}
              </span>
              {activeLevelData && (
                <span className="text-[11px] text-emerald-400 font-semibold truncate">
                  — {activeLevelData.powerPerCycle.toLocaleString()} power / cycle
                </span>
              )}
            </div>
          )}
        </div>

        <AltArrowDownLinear
          size={14}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Menu Window */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1.5 z-50 max-h-60 overflow-y-auto p-1.5 rounded-2xl bg-[#16161c] shadow-2xl shadow-black/95 ring-1 ring-white/10 scrollbar-thin space-y-1 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Level 0 option: Not owned */}
          <button
            type="button"
            data-selected={currentLevel === 0 ? 'true' : 'false'}
            onClick={() => {
              onChange(0);
              setIsOpen(false);
            }}
            className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-colors border-none cursor-pointer ${
              currentLevel === 0
                ? 'bg-[#252532] text-white ring-1 ring-white/10'
                : 'text-slate-400 hover:text-white hover:bg-[#1f1f28]'
            }`}
          >
            <span>— {isEs ? 'No adquirida' : 'Not owned'} —</span>
            {currentLevel === 0 && <span className="text-emerald-400 text-xs">✓</span>}
          </button>

          {/* Level 1..N options */}
          {levels.map((lvl) => {
            const isSelected = lvl.level === currentLevel;
            return (
              <button
                key={lvl.level}
                type="button"
                data-selected={isSelected ? 'true' : 'false'}
                onClick={() => {
                  onChange(lvl.level);
                  setIsOpen(false);
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-mono flex items-center justify-between transition-colors border-none cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/70 text-white ring-1 ring-emerald-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#1f1f28]'
                }`}
              >
                <div className="flex items-baseline gap-2 truncate">
                  <span className={`font-bold ${isSelected ? 'text-emerald-300 font-black' : 'text-white'}`}>
                    {isEs ? 'Nivel' : 'Level'} {lvl.level}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lvl.powerPerCycle.toLocaleString()} power / cycle
                  </span>
                </div>
                {isSelected && <span className="text-emerald-400 font-black text-xs shrink-0">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
