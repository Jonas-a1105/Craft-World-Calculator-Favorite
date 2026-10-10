import React, { useState, useRef, useEffect } from 'react';
import { AltArrowDownLinear } from 'solar-icon-set';

interface ProfitabilityLevelSelectorProps {
  level: number;
  maxLevel: number;
  onChange: (level: number) => void;
  onMaxLevel: () => void;
}

export const ProfitabilityLevelSelector: React.FC<ProfitabilityLevelSelectorProps> = ({
  level,
  maxLevel,
  onChange,
  onMaxLevel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen && gridRef.current) {
      const activeBtn = gridRef.current.querySelector<HTMLButtonElement>('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [isOpen]);

  const levelOptions = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-1 select-none">
      {/* Trigger Button with Level */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black transition-all border-none outline-none cursor-pointer shadow-sm active:scale-95 ${
          isOpen
            ? 'bg-amber-500 text-black shadow-amber-500/20'
            : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-white'
        }`}
        title="Cambiar nivel"
      >
        <span className="tabular-nums">
          {level}/{maxLevel}
        </span>
        <AltArrowDownLinear
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-black' : 'text-zinc-400'
          }`}
        />
      </button>

      {/* Quick Max Button (M) */}
      <button
        type="button"
        onClick={onMaxLevel}
        className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-all border-none outline-none cursor-pointer active:scale-95 ${
          level >= maxLevel
            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
            : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white'
        }`}
        title="Maximizar al nivel máximo"
      >
        M
      </button>

      {/* Styled Popover Window */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#18181c]/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] z-50 animate-in fade-in zoom-in-95 duration-150 border border-white/5 space-y-2">
          {/* Quick Header */}
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-zinc-400 border-b border-zinc-800/60 pb-1.5">
            <span>Seleccionar Nivel</span>
            <button
              type="button"
              onClick={() => {
                onMaxLevel();
                setIsOpen(false);
              }}
              className="text-amber-400 hover:text-amber-300 font-extrabold text-[10px]"
            >
              MAX (Lv. {maxLevel})
            </button>
          </div>

          {/* Level Grid (Scrollable) */}
          <div
            ref={gridRef}
            className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto no-scrollbar py-1 px-0.5"
          >
            {levelOptions.map((lvl) => {
              const isSelected = lvl === level;
              return (
                <button
                  key={lvl}
                  type="button"
                  data-active={isSelected}
                  onClick={() => {
                    onChange(lvl);
                    setIsOpen(false);
                  }}
                  className={`h-7 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center justify-center tabular-nums ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
