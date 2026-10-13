import React, { useState, useRef, useEffect } from 'react';
import { AltArrowDownLinear } from 'solar-icon-set';
import { getFactoryDisplayLevel } from '../../../services/craftworldCalculations';

interface BaseCostLevelSelectorProps {
  token: string;
  curLevel: number;
  maxLevel: number;
  onLevelChange: (token: string, level: number) => void;
}

export const BaseCostLevelSelector: React.FC<BaseCostLevelSelectorProps> = ({
  token,
  curLevel,
  maxLevel,
  onLevelChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  // Scroll active level into view when opened
  useEffect(() => {
    if (isOpen && gridRef.current) {
      const activeBtn = gridRef.current.querySelector<HTMLButtonElement>('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [isOpen]);

  const handleSelect = (lvl: number) => {
    const clamped = Math.max(1, Math.min(maxLevel, lvl));
    onLevelChange(token, clamped);
  };

  return (
    <div ref={containerRef} className="relative inline-block select-none">
      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group/lvl flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono transition-all border-none outline-none cursor-pointer shadow-sm active:scale-95 ${
          isOpen
            ? 'bg-[#202026] text-white'
            : 'bg-oled-cardInner hover:bg-oled-pillHover text-slate-200'
        }`}
                title={`Nivel ${getFactoryDisplayLevel(curLevel)} de ${getFactoryDisplayLevel(maxLevel)} (Click para cambiar)`}
        aria-expanded={isOpen}
      >
        <span className="font-bold text-amber-300">{getFactoryDisplayLevel(curLevel)}</span>
        <span className="text-[11px] text-slate-400 font-normal">/{getFactoryDisplayLevel(maxLevel)}</span>
        <AltArrowDownLinear
          size={12}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-amber-400' : 'group-hover/lvl:text-slate-200'
          }`}
        />
      </button>

      {/* Custom Designed Level Selection Window */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 p-3 rounded-2xl bg-oled-card shadow-md border-none animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-300">
                Nivel de Fábrica
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Rango: 1 al {maxLevel}
              </div>
            </div>

            {/* Stepper buttons (- / +) */}
            <div className="flex items-center gap-1 font-mono">
              <button
                type="button"
                onClick={() => handleSelect(curLevel - 1)}
                disabled={curLevel <= 1}
                aria-label="Bajar un nivel"
                className="w-8 h-8 rounded-lg bg-oled-pill hover:bg-oled-pillHover disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-bold text-amber-300">
                {getFactoryDisplayLevel(curLevel)}
              </span>
              <button
                type="button"
                onClick={() => handleSelect(curLevel + 1)}
                disabled={curLevel >= maxLevel}
                aria-label="Subir un nivel"
                className="w-8 h-8 rounded-lg bg-oled-pill hover:bg-oled-pillHover disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Presets (Min / Max) */}
          <div className="grid grid-cols-2 gap-1.5 py-2">
            <button
              type="button"
              onClick={() => {
                handleSelect(1);
                setIsOpen(false);
              }}
              className={`py-1 px-2 rounded-xl text-[11px] font-mono font-semibold transition-colors border-none cursor-pointer ${
                curLevel === 1
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-oled-cardInner text-slate-300 hover:bg-oled-pillHover hover:text-white'
              }`}
            >
              Nivel Min (1)
            </button>
            <button
              type="button"
              onClick={() => {
                handleSelect(maxLevel);
                setIsOpen(false);
              }}
              className={`py-1 px-2 rounded-xl text-[11px] font-mono font-semibold transition-colors border-none cursor-pointer ${
                curLevel === maxLevel
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-oled-cardInner text-slate-300 hover:bg-oled-pillHover hover:text-white'
              }`}
            >
              Nivel Max ({maxLevel})
            </button>
          </div>

          {/* Scrollable Levels Grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-5 gap-1.5 max-h-44 overflow-y-auto pr-1 pt-1 [scrollbar-width:thin] [scrollbar-color:#333_transparent]"
          >
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map((lvl) => {
              const isActive = lvl === curLevel;
              return (
                <button
                  key={lvl}
                  type="button"
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => {
                    handleSelect(lvl);
                    setIsOpen(false);
                  }}
                  className={`h-8 rounded-xl font-mono text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/25 scale-105'
                      : 'bg-oled-cardInner text-slate-300 hover:bg-[#252530] hover:text-white'
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
