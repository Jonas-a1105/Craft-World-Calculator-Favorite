import React, { useState } from 'react';
import { formatCompact } from '../utils/formatters';
import { useTranslation } from '../../../utils/i18n';

export interface BarDataPoint {
  level: number;
  value: number;
}

interface Props {
  title: string;
  data: BarDataPoint[];
  infoTooltip?: string;
  accentColor?: string;
  selectedIndex?: number;
  onSelectIndex?: (idx: number) => void;
}

export const ExecutiveBarChart: React.FC<Props> = ({
  title,
  data,
  infoTooltip,
  accentColor = '#f59e0b',
  selectedIndex: controlledIndex,
  onSelectIndex,
}) => {
  const { language } = useTranslation();
  const [internalIndex, setInternalIndex] = useState<number>(data.length > 0 ? data.length - 1 : 0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const setIndex = onSelectIndex || setInternalIndex;

  const minVal = data[0].value;
  const maxVal = Math.max(...data.map((d) => d.value));

  const displayIndex = hoveredIndex !== null ? hoveredIndex : Math.min(currentIndex, data.length - 1);
  const currentPoint = data[displayIndex] || data[data.length - 1];
  const currentVal = currentPoint.value;
  const diffFromBase = currentVal - minVal;

  const TOTAL_BARS = 30;

  // Active bar count mapped proportionally across levels (1 to 30)
  const activeBars = Math.max(
    1,
    Math.min(TOTAL_BARS, Math.round(((displayIndex + 1) / data.length) * TOTAL_BARS))
  );

  const cycleLevel = (delta: number) => {
    const next = Math.max(0, Math.min(data.length - 1, currentIndex + delta));
    setIndex(next);
  };

  const handleBarInteraction = (barIdx: number) => {
    const mapped = Math.min(data.length - 1, Math.floor((barIdx / TOTAL_BARS) * data.length));
    setHoveredIndex(mapped);
  };

  const handleBarClick = (barIdx: number) => {
    const mapped = Math.min(data.length - 1, Math.floor((barIdx / TOTAL_BARS) * data.length));
    setIndex(mapped);
  };

  return (
    <section className="bg-[#16171b] rounded-[22px] p-4 transition-all duration-200 shadow-xl flex flex-col justify-between select-none min-w-0 w-full group border-none">
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-1 min-w-0">
        <div className="flex items-center gap-1.5 text-zinc-200 font-medium text-[13px] tracking-tight">
          {/* Energy Bolt SVG */}
          <svg className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="truncate uppercase font-sans font-semibold tracking-wide text-zinc-300">
            {title}
          </span>
          <span
            className="w-3.5 h-3.5 rounded-full bg-[#1e1f25] text-[9px] flex items-center justify-center text-zinc-400 cursor-help shrink-0 border-none select-none"
            title={infoTooltip || (language === 'es' ? 'Consumo de energía por ciclo escalonado por nivel' : 'Energy cost per cycle')}
          >
            i
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-md bg-[#1e1f25] text-amber-400 font-mono text-[11px] font-semibold tracking-tight shrink-0 border-none">
          {language === 'es' ? `Niv. ${currentPoint.level}` : `Lv. ${currentPoint.level}`}
        </span>
      </div>

      {/* 2. Metric Stat Headline */}
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span className="text-3xl font-extrabold text-white tracking-tight leading-none font-sans font-mono flex items-center gap-1.5">
          {currentVal >= 1000 ? formatCompact(currentVal) : currentVal}
          <svg className="w-4 h-4 text-amber-400 shrink-0 inline" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </span>
        <span className="text-xs font-semibold text-zinc-400 flex items-center gap-0.5">
          {diffFromBase > 0 ? (
            <span className="text-amber-400 font-mono font-bold flex items-center gap-0.5">
              <svg className="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +{diffFromBase >= 1000 ? formatCompact(diffFromBase) : diffFromBase}
              <span className="text-zinc-500 font-normal font-sans ml-1">
                {language === 'es' ? 'vs base' : 'vs base'}
              </span>
            </span>
          ) : (
            <span className="text-zinc-400 font-medium">
              {language === 'es' ? 'Base fija' : 'Flat rate'}
            </span>
          )}
        </span>
      </div>

      {/* 3. Segmented Barcode Visualizer (30 individual vertical bars with wave formula) */}
      <div className="w-full bg-[#121316] p-2.5 rounded-xl border-none mb-3 relative overflow-hidden">
        <div
          className="flex items-end justify-between gap-[3px] h-[32px] w-full px-0.5"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {Array.from({ length: TOTAL_BARS }).map((_, i) => {
            const isActive = i < activeBars;
            let targetHeight = 14;
            if (isActive) {
              const wave = Math.sin((i / activeBars) * Math.PI) * 12;
              targetHeight = Math.min(29, Math.max(14, Math.round(16 + wave)));
            }

            return (
              <div
                key={i}
                className="flex-1 rounded-[1.5px] cursor-pointer transition-all duration-150 border-none"
                style={{
                  height: `${targetHeight}px`,
                  backgroundColor: isActive ? accentColor : '#22242a',
                  boxShadow: isActive ? `0 0 6px rgba(245, 158, 11, 0.45)` : 'none',
                }}
                onMouseEnter={() => handleBarInteraction(i)}
                onClick={() => handleBarClick(i)}
                title={`Nivel ${data[Math.min(data.length - 1, Math.floor((i / TOTAL_BARS) * data.length))].level}`}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Carousel Row: Level Name + Controls + Quantity */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        {/* Level Selector & Carousel Controls */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-200 text-[13px]">
            {language === 'es' ? `Nivel ${currentPoint.level}` : `Level ${currentPoint.level}`}
          </span>
          <div className="flex items-center bg-[#1e1f25] rounded-lg p-0.5 gap-0.5 border-none">
            <button
              type="button"
              onClick={() => cycleLevel(-1)}
              disabled={currentIndex === 0}
              className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/40 rounded transition-colors border-none disabled:opacity-30 disabled:cursor-not-allowed"
              title={language === 'es' ? 'Nivel anterior' : 'Previous level'}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => cycleLevel(1)}
              disabled={currentIndex === data.length - 1}
              className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/40 rounded transition-colors border-none disabled:opacity-30 disabled:cursor-not-allowed"
              title={language === 'es' ? 'Siguiente nivel' : 'Next level'}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Base & Max */}
        <div className="flex items-center gap-1.5 text-zinc-300 text-[12px] font-medium font-mono">
          <span className="text-zinc-400">{language === 'es' ? 'Base:' : 'Base:'} {minVal}</span>
          <span className="text-zinc-500 font-bold">•</span>
          <span className="text-amber-400 font-semibold">{language === 'es' ? 'Máx:' : 'Max:'} {maxVal}</span>
        </div>
      </div>
    </section>
  );
};
