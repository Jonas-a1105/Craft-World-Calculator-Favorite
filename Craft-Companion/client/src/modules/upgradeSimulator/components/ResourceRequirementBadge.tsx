import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ResourceIcon } from '../../../components/GameIcon';
import type { RequiredResource } from '../types';

interface ResourceRequirementBadgeProps {
  resource: RequiredResource;
  baseSymbol?: string;
  language?: string;
}

function formatResourceAmount(val: number): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(2)}K`;
  }
  return val % 1 === 0 ? val.toString() : val.toFixed(1);
}

function formatCoin(val: number): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(2)}K`;
  }
  return val.toFixed(2);
}

export const ResourceRequirementBadge: React.FC<ResourceRequirementBadgeProps> = ({
  resource,
  baseSymbol = 'COIN',
  language = 'en',
}) => {
  const isEs = language === 'es';
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, []);

  const showPopover = isHovered || isClicked;

  // Track position whenever popover is shown or on scroll/resize
  useEffect(() => {
    if (showPopover) {
      updatePosition();
      const handleReposition = () => updatePosition();
      window.addEventListener('scroll', handleReposition, true);
      window.addEventListener('resize', handleReposition);
      return () => {
        window.removeEventListener('scroll', handleReposition, true);
        window.removeEventListener('resize', handleReposition);
      };
    }
  }, [showPopover, updatePosition]);

  // Close clicked popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        badgeRef.current &&
        !badgeRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsClicked(false);
      }
    }
    if (isClicked) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClicked]);

  return (
    <div className="inline-flex items-center shrink-0">
      {/* Clickable / Pressable Badge */}
      <button
        ref={badgeRef}
        type="button"
        onClick={() => {
          setIsClicked((prev) => !prev);
          updatePosition();
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          updatePosition();
        }}
        onMouseLeave={() => setIsHovered(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer select-none border-none outline-none shadow-inner ${
          showPopover
            ? 'bg-[#22222c] ring-1 ring-amber-400/60 shadow-md shadow-amber-500/15'
            : 'bg-[#131316] hover:bg-[#1a1a20] active:scale-95'
        }`}
      >
        <ResourceIcon symbol={resource.token} size={16} />
        <span className="text-xs font-mono font-bold text-white">
          {formatResourceAmount(resource.amount)}
        </span>
        <span className="text-[10px] text-slate-400 font-mono uppercase">
          {resource.token}
        </span>
      </button>

      {/* Portal-rendered Popover: immune to all parent overflow clipping */}
      {showPopover &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: 'translate(-50%, -100%)',
              zIndex: 99999,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-56 p-3 rounded-2xl bg-[#1c1c24] ring-1 ring-white/10 shadow-2xl shadow-black/95 pointer-events-auto space-y-2 select-none animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Popover Header */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-1.5">
              <ResourceIcon symbol={resource.token} size={18} />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block uppercase tracking-tight truncate">
                  {resource.token}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {isEs ? 'Recurso Requerido' : 'Required Resource'}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-1.5 font-mono text-xs">
              {/* Exact Required Amount */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] text-slate-400">
                  {isEs ? 'Cantidad total:' : 'Total quantity:'}
                </span>
                <span className="font-bold text-white">
                  {resource.amount.toLocaleString()} {resource.token}
                </span>
              </div>

              {/* Unit Market Price */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] text-slate-400">
                  {isEs ? 'Precio unitario:' : 'Unit price:'}
                </span>
                <div className="flex items-center gap-1 font-bold text-slate-200">
                  <span>{formatCoin(resource.unitPrice)}</span>
                  <ResourceIcon symbol="COIN" size={11} />
                </div>
              </div>

              {/* Total Cost */}
              <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                <span className="text-[10px] text-amber-300 font-semibold">
                  {isEs ? 'Valor total:' : 'Total value:'}
                </span>
                <div className="flex items-center gap-1 font-bold text-amber-300">
                  <span>{formatCoin(resource.totalCoin)}</span>
                  <ResourceIcon symbol="COIN" size={13} />
                </div>
              </div>
            </div>

            {/* Downward pointing arrow */}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(45deg)',
              }}
              className="w-2.5 h-2.5 bg-[#1c1c24] border-r border-b border-white/10"
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
