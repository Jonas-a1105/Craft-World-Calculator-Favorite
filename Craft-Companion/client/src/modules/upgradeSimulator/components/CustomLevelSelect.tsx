import React, { useState, useRef, useEffect } from 'react';
import { AltArrowDownLinear } from 'solar-icon-set';

interface CustomLevelSelectProps {
  label: string;
  value: number;
  options: number[];
  onChange: (val: number) => void;
  accentColor?: 'white' | 'amber';
}

export const CustomLevelSelect: React.FC<CustomLevelSelectProps> = ({
  label,
  value,
  options,
  onChange,
  accentColor = 'white',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on click outside
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

  // Scroll to selected item when opened
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeBtn = listRef.current.querySelector<HTMLButtonElement>('[data-selected="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const valueColor = accentColor === 'amber' ? 'text-amber-300' : 'text-white';

  return (
    <div ref={containerRef} className="relative w-full min-w-0 select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#131316] hover:bg-[#1a1a20] active:bg-[#202028] transition-all border-none outline-none cursor-pointer shadow-inner"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            {label}
          </span>
          <span className={`text-xs font-black ${valueColor}`}>
            {value}
          </span>
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
          className="absolute top-full left-0 right-0 mt-1.5 z-50 max-h-56 overflow-y-auto p-1.5 rounded-2xl bg-[#16161c] shadow-2xl shadow-black/90 ring-1 ring-white/10 scrollbar-thin space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((lvl) => {
            const isSelected = lvl === value;
            return (
              <button
                key={lvl}
                type="button"
                data-selected={isSelected ? 'true' : 'false'}
                onClick={() => {
                  onChange(lvl);
                  setIsOpen(false);
                }}
                className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-colors border-none cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#22222b]'
                }`}
              >
                <span>{lvl}</span>
                {isSelected && <span className="text-[10px] uppercase font-mono">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
