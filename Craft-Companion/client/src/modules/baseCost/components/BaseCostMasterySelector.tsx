import React, { useState, useRef, useEffect } from 'react';
import { MASTERY_MULTIPLIERS } from '../data/baseCostCatalog';
import { AltArrowDownLinear } from 'solar-icon-set';

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const curMult = MASTERY_MULTIPLIERS[mastery] ?? 1;
  const curBonusPct = ((curMult - 1) * 100).toFixed(2);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeBtn = listRef.current.querySelector<HTMLButtonElement>('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [isOpen]);

  const handleSelect = (lvl: number) => {
    onMasteryChange(token, lvl);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block select-none">
      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group/mast flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono transition-all border-none outline-none cursor-pointer shadow-sm active:scale-95 ${
          isOpen
            ? 'bg-[#22222a] text-white'
            : mastery > 0
            ? 'bg-purple-500/20 text-purple-300 font-bold'
            : 'bg-[#131316] hover:bg-[#1c1c22] text-slate-300'
        }`}
        title={`Maestría ${mastery} (+${curBonusPct}% bono de reducción)`}
        aria-expanded={isOpen}
      >
        <span>M{mastery}</span>
        <AltArrowDownLinear
          size={12}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-purple-400' : 'group-hover/mast:text-slate-200'
          }`}
        />
      </button>

      {/* Custom Designed Mastery Window */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-56 p-3 rounded-2xl bg-[#16161c] shadow-2xl shadow-black/95 border-none animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-300">
                Maestría
              </div>
              <div className="text-[10px] text-purple-400 font-mono font-semibold">
                +{curBonusPct}% Reducción
              </div>
            </div>

            {/* Quick Reset Button */}
            <button
              type="button"
              onClick={() => handleSelect(0)}
              className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#22222a] hover:bg-[#2c2c36] text-slate-400 hover:text-white transition-colors border-none cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 gap-1.5 py-2">
            <button
              type="button"
              onClick={() => handleSelect(0)}
              className={`py-1 px-2 rounded-xl text-[11px] font-mono font-semibold transition-colors border-none cursor-pointer ${
                mastery === 0
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-[#1c1c22] text-slate-300 hover:bg-[#262630] hover:text-white'
              }`}
            >
              M0 (0%)
            </button>
            <button
              type="button"
              onClick={() => handleSelect(10)}
              className={`py-1 px-2 rounded-xl text-[11px] font-mono font-semibold transition-colors border-none cursor-pointer ${
                mastery === 10
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-[#1c1c22] text-slate-300 hover:bg-[#262630] hover:text-white'
              }`}
            >
              M10 (+5.25%)
            </button>
          </div>

          {/* List of 11 Mastery Levels */}
          <div
            ref={listRef}
            className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 pt-1 [scrollbar-width:thin] [scrollbar-color:#333_transparent]"
          >
            {Array.from({ length: 11 }, (_, i) => {
              const mult = MASTERY_MULTIPLIERS[i] ?? 1;
              const bonus = ((mult - 1) * 100).toFixed(2);
              const isActive = i === mastery;

              return (
                <button
                  key={i}
                  type="button"
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => handleSelect(i)}
                  className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all border-none cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/30'
                      : 'bg-[#131316] text-slate-300 hover:bg-[#252530] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">M{i}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Nivel {i}
                    </span>
                  </div>
                  <span className={`text-[11px] ${isActive ? 'text-white' : 'text-purple-400'}`}>
                    +{bonus}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
