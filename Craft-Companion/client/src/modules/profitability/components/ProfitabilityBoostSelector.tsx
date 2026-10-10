import React, { useState, useRef, useEffect } from 'react';
import { AltArrowDownLinear, BoltBold, CheckCircleBold } from 'solar-icon-set';
import type { BoostOption } from '../types';

interface ProfitabilityBoostSelectorProps {
  boost: BoostOption;
  onChange: (boost: BoostOption) => void;
}

export const ProfitabilityBoostSelector: React.FC<ProfitabilityBoostSelectorProps> = ({
  boost,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const options: Array<{ id: BoostOption; label: string; desc: string }> = [
    { id: 'None', label: 'None', desc: '1x Velocidad base' },
    { id: 'x2', label: 'x2 Boost', desc: '2x Acelerador activo' },
  ];

  return (
    <div ref={containerRef} className="relative inline-block select-none">
      {/* Trigger Button (Sleek pill with styled arrow, zero border) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-none outline-none cursor-pointer shadow-sm active:scale-95 ${
          isOpen
            ? 'bg-amber-500 text-black shadow-amber-500/20'
            : boost === 'x2'
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300'
        }`}
      >
        {boost === 'x2' && <BoltBold className="w-3.5 h-3.5 text-amber-400" />}
        <span>{boost}</span>
        <AltArrowDownLinear
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-black' : 'text-zinc-400'
          }`}
        />
      </button>

      {/* Styled Popover Window (Rounded 2xl, Backdrop blur, Clean App Tokens, Zero harsh borders) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-[#18181c]/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] z-50 animate-in fade-in zoom-in-95 duration-150 border border-white/5">
          <div className="space-y-1">
            {options.map((opt) => {
              const isSelected = boost === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all border-none cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                      : 'hover:bg-zinc-800/80 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      {opt.id === 'x2' && (
                        <BoltBold
                          className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-amber-400'}`}
                        />
                      )}
                      <span>{opt.label}</span>
                    </div>
                    <div
                      className={`text-[10px] ${
                        isSelected ? 'text-black/80 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {opt.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircleBold className="w-4 h-4 text-black flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
