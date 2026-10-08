import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StarBold } from 'solar-icon-set';
import type { LandingImpactSection, TestimonialItem } from '../types';

interface LandingImpactProps {
  impact: LandingImpactSection;
}

interface MarqueeRowProps {
  items: TestimonialItem[];
  speed?: number; // pixels per second
  direction?: 'left' | 'right';
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ items, speed = 28, direction = 'left' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Repeat items 3 times for seamless wrapping
  const repeatedItems = [...items, ...items, ...items];

  useEffect(() => {
    let animId: number;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const track = trackRef.current;
      if (track) {
        const singleSetWidth = track.scrollWidth / 3;

        if (!isDraggingRef.current && singleSetWidth > 0) {
          const move = (direction === 'left' ? -1 : 1) * speed * delta;
          offsetRef.current += move;

          // Wrap seamlessly
          if (direction === 'left' && offsetRef.current <= -singleSetWidth) {
            offsetRef.current += singleSetWidth;
          } else if (direction === 'right' && offsetRef.current >= 0) {
            offsetRef.current -= singleSetWidth;
          }
        }

        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [speed, direction]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    setIsGrabbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    offsetRef.current = dragStartOffsetRef.current + deltaX;

    const track = trackRef.current;
    if (track) {
      const singleSetWidth = track.scrollWidth / 3;
      if (singleSetWidth > 0) {
        while (offsetRef.current <= -singleSetWidth) {
          offsetRef.current += singleSetWidth;
          dragStartOffsetRef.current += singleSetWidth;
        }
        while (offsetRef.current >= 0) {
          offsetRef.current -= singleSetWidth;
          dragStartOffsetRef.current -= singleSetWidth;
        }
      }
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    setIsGrabbing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`w-full overflow-hidden select-none py-2 touch-pan-y ${
        isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ WebkitUserSelect: 'none' }}
    >
      <div
        ref={trackRef}
        className="inline-flex gap-5 will-change-transform"
        style={{ transform: `translate3d(${offsetRef.current}px, 0, 0)` }}
      >
        {repeatedItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="w-[320px] sm:w-[350px] bg-[#1c1c20] hover:bg-[#222227] rounded-3xl p-6 flex flex-col justify-between shadow-xl flex-shrink-0 transition-colors pointer-events-none border-0"
          >
            <div>
              {/* Card Header: Avatar & Info */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#141415] flex-shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white block truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 block truncate mt-0.5">
                    {item.role}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                "{item.quote}"
              </p>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 text-amber-400 text-xs mt-5">
              {Array.from({ length: item.stars }).map((_, sIdx) => (
                <StarBold key={sIdx} className="w-3.5 h-3.5 text-amber-400" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LandingImpact: React.FC<LandingImpactProps> = ({ impact }) => {
  return (
    <section id="impact" className="w-full pt-10 pb-32 text-center relative z-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1c1c20] text-xs font-medium text-zinc-300 mb-5 backdrop-blur-sm shadow-inner transition-transform hover:scale-105 border-0">
          <span>{impact.badge}</span>
        </div>

        {/* Main Headline with Game Font */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-game tracking-wide text-white leading-tight mb-3">
          {impact.title}
        </h2>

        {/* Subtitle */}
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
          {impact.subtitle}
        </p>

        {/* Review Badge Rating Widget */}
        <div className="inline-flex items-center gap-3 bg-[#1c1c20] rounded-2xl px-4 py-2.5 mb-10 shadow-lg border-0">
          <div className="w-8 h-8 rounded-xl bg-[#151518] flex items-center justify-center text-amber-400 flex-shrink-0 border-0">
            <svg
              className="w-4 h-4 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-400 gap-0.5">
                <StarBold className="w-3.5 h-3.5 text-amber-400" />
                <StarBold className="w-3.5 h-3.5 text-amber-400" />
                <StarBold className="w-3.5 h-3.5 text-amber-400" />
                <StarBold className="w-3.5 h-3.5 text-amber-400" />
                <StarBold className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-sm font-bold text-white font-mono">{impact.ratingBadge.score}</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              {impact.ratingBadge.basedOn}
            </span>
          </div>
        </div>

        {/* Top Metrics Card (4 KPIs Grid) */}
        <div className="bg-[#1c1c20] rounded-3xl p-6 sm:p-8 mb-14 shadow-2xl border-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {impact.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center md:px-4"
              >
                {/* Metric Icon */}
                <div className="w-8 h-8 mb-3 flex items-center justify-center text-amber-400">
                  {metric.icon === 'bolt' && (
                    <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  )}
                  {metric.icon === 'trend' && (
                    <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  )}
                  {metric.icon === 'users' && (
                    <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  )}
                  {metric.icon === 'star' && (
                    <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </div>

                {/* Big Value */}
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight block font-mono">
                  {metric.value}
                </span>

                {/* Subtitle Label */}
                <span className="text-xs text-zinc-400 font-medium mt-1 block">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infinite Draggable Testimonial Rows (Full Bleed Width) */}
      <div className="space-y-5 relative">
        {/* Row 1: Smooth Auto-scroll Left + Grab & Drag */}
        <MarqueeRow items={impact.testimonialsRow1} speed={25} direction="left" />

        {/* Row 2: Smooth Auto-scroll Right + Grab & Drag */}
        <MarqueeRow items={impact.testimonialsRow2} speed={22} direction="right" />

        {/* Gradient edge masks for sleek fade out at viewport borders */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#141415] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#141415] to-transparent z-10" />
      </div>
    </section>
  );
};
