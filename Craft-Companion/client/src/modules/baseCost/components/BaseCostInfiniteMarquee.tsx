import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatCoin } from '../services/baseCostFormatters';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { useTranslation } from '../../../utils/i18n';

export interface MarqueeResourceItem {
  token: string;
  name: string;
  price: number;
  category?: string;
  color?: string;
}

interface BaseCostInfiniteMarqueeProps {
  items: MarqueeResourceItem[];
}

export const BaseCostInfiniteMarquee: React.FC<BaseCostInfiniteMarqueeProps> = ({
  items,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { language } = useTranslation();

  // Duplicated list for seamless wrapping
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    return [...items, ...items];
  }, [items]);

  const [isGrabbing, setIsGrabbing] = useState(false);
  // Control del usuario (QW5): pausa manual + pausa al enfocar con el cursor.
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const isHoverPausedRef = useRef(false);
  useEffect(() => {
    isPausedRef.current = isPaused || reducedMotion;
  }, [isPaused, reducedMotion]);

  // Physics animation refs (in pixels per frame, baseline: -0.75 px/frame)
  const baseSpeed = -0.75;
  const offsetRef = useRef(0);
  const velocityRef = useRef(baseSpeed);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);

  // Main 60fps physics simulation loop
  useEffect(() => {
    if (displayItems.length === 0 || reducedMotion) return;

    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = Math.min(32, Math.max(8, timestamp - lastTimestamp)) / 16.667;
      lastTimestamp = timestamp;

      const track = trackRef.current;
      if (track) {
        const halfWidth = track.scrollWidth / 2;

        // Con pausa manual/hover solo se detiene el avance automático;
        // el arrastre manual siempre responde.
        if (!isDraggingRef.current && halfWidth > 0 && !isPausedRef.current && !isHoverPausedRef.current) {
          // Advance position by current velocity
          offsetRef.current += velocityRef.current * dt;

          // Momentum decay: Smoothly decelerate added speed toward baseline speed
          const decay = Math.pow(0.965, dt);
          velocityRef.current = baseSpeed + (velocityRef.current - baseSpeed) * decay;

          // Seamless infinite wrap in both directions
          while (offsetRef.current <= -halfWidth) {
            offsetRef.current += halfWidth;
          }
          while (offsetRef.current > 0) {
            offsetRef.current -= halfWidth;
          }

          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [displayItems.length, reducedMotion]);

  // Pointer event handlers (Mouse Drag & Touch Swipe)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    setIsGrabbing(true);
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if capture not supported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const now = performance.now();
    const deltaX = e.clientX - lastXRef.current;
    const dt = Math.max(1, now - lastTimeRef.current);

    // Apply delta directly to offset for 1:1 responsive touch tracking
    offsetRef.current += deltaX;

    const track = trackRef.current;
    if (track) {
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0) {
        while (offsetRef.current <= -halfWidth) {
          offsetRef.current += halfWidth;
        }
        while (offsetRef.current > 0) {
          offsetRef.current -= halfWidth;
        }
      }
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }

    // Measure release velocity (normalized to px per 60fps frame)
    const instantV = (deltaX / dt) * 16.667;
    dragVelocityRef.current = dragVelocityRef.current * 0.35 + instantV * 0.65;

    lastXRef.current = e.clientX;
    lastTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);

    // Transfer fling momentum into velocity with realistic limits
    const maxVelocity = 28;
    let releaseV = dragVelocityRef.current;

    // If released while nearly stationary, gently resume base speed
    if (Math.abs(releaseV) < 0.2) {
      releaseV = baseSpeed;
    } else {
      releaseV = Math.max(-maxVelocity, Math.min(maxVelocity, releaseV));
    }

    velocityRef.current = releaseV;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Mouse wheel horizontal scrolling with inertia
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Determine wheel movement delta (horizontal or vertical fallback)
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 1) {
      // Add wheel impulse to velocity
      const impulse = -delta * 0.08;
      const maxVelocity = 24;
      velocityRef.current = Math.max(
        -maxVelocity,
        Math.min(maxVelocity, velocityRef.current + impulse)
      );
    }
  };

  if (!items || items.length === 0) return null;

  const isEs = language === 'es';

  // Reduced motion: sin loop rAF — lista estática con scroll horizontal manual.
  if (reducedMotion) {
    return (
      <div
        aria-label={isEs ? 'Precios de recursos en vivo' : 'Live resource prices'}
        className="w-full relative py-1"
      >
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="flex gap-3 w-max">
            {items.map((item) => (
              <div
                key={item.token}
                className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-oled-card shadow-md shrink-0 border-none"
              >
                <ResourceIcon symbol={item.token} size={28} className="drop-shadow-sm shrink-0" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-100">
                      {item.name}
                    </span>
                    {item.category && (
                      <span className="text-[11px] font-mono uppercase text-slate-400">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-300">
                    <span>{formatCoin(item.price)}</span>
                    <ResourceIcon symbol="COIN" size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={isEs ? 'Precios de recursos en vivo' : 'Live resource prices'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onMouseEnter={() => {
        isHoverPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isHoverPausedRef.current = false;
      }}
      className={`w-full overflow-hidden select-none relative py-1 touch-pan-y ${
        isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Edge gradients matching app background for smooth fade in/out */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#141415] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#141415] to-transparent z-10" />

      {/* Pause/Resume control (QW5) — motion user control */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setIsPaused((v) => !v)}
        aria-pressed={isPaused}
        aria-label={isPaused ? (isEs ? 'Reanudar marquee' : 'Resume marquee') : (isEs ? 'Pausar marquee' : 'Pause marquee')}
        title={isPaused ? (isEs ? 'Reanudar desplazamiento automático' : 'Resume auto-scroll') : (isEs ? 'Pausar desplazamiento automático' : 'Pause auto-scroll')}
        className="absolute right-2 -top-1 z-20 w-7 h-7 rounded-full bg-oled-pill/95 hover:bg-oled-pillHover text-zinc-300 hover:text-white flex items-center justify-center transition-colors border-0 outline-none cursor-pointer shadow-md"
      >
        {isPaused ? (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3 1.5v9l8-4.5-8-4.5z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1.5" width="3" height="9" rx="1" />
            <rect x="7" y="1.5" width="3" height="9" rx="1" />
          </svg>
        )}
      </button>

      {/* Marquee Track Container with will-change for high performance 60fps */}
      <div
        ref={trackRef}
        className="flex gap-3 w-max will-change-transform"
        style={{ transform: `translate3d(${offsetRef.current}px, 0, 0)` }}
      >
        {displayItems.map((item, idx) => (
          <div
            key={`${item.token}-${idx}`}
            className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-oled-card hover:bg-oled-pillHover transition-colors shadow-md shrink-0 border-none select-none pointer-events-none"
          >
            {/* Resource Icon from App */}
            <ResourceIcon symbol={item.token} size={28} className="drop-shadow-sm shrink-0" />

            {/* Token Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-slate-100">
                  {item.name}
                </span>
                {item.category && (
                  <span className="text-[11px] font-mono uppercase text-slate-400">
                    {item.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-300">
                <span>{formatCoin(item.price)}</span>
                <ResourceIcon symbol="COIN" size={13} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
