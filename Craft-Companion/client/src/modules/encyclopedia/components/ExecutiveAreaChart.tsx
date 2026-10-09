import React, { useState } from 'react';
import { formatCompact } from '../utils/formatters';
import { useTranslation } from '../../../utils/i18n';

export interface AreaDataPoint {
  level: number;
  value: number;
}

interface Props {
  title: string;
  data: AreaDataPoint[];
  color: string;
  gradientId: string;
  infoTooltip?: string;
  valueFormatter?: (val: number) => string;
  selectedIndex?: number;
  onSelectIndex?: (idx: number) => void;
  icon?: React.ReactNode;
}

export const ExecutiveAreaChart: React.FC<Props> = ({
  title,
  data,
  color,
  gradientId,
  infoTooltip,
  valueFormatter = formatCompact,
  selectedIndex: controlledIndex,
  onSelectIndex,
  icon,
}) => {
  const { language } = useTranslation();
  const [internalIndex, setInternalIndex] = useState<number>(data.length > 0 ? data.length - 1 : 0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const setIndex = onSelectIndex || setInternalIndex;

  const minVal = data[0].value;
  const maxVal = Math.max(...data.map((d) => d.value), minVal + 1);

  const displayIndex = hoveredIndex !== null ? hoveredIndex : Math.min(currentIndex, data.length - 1);
  const currentPoint = data[displayIndex] || data[data.length - 1];
  const currentVal = currentPoint.value;

  const totalGrowthPercent =
    minVal > 0 ? Math.round(((maxVal - minVal) / minVal) * 100) : 0;
  const diffFromBase = currentVal - minVal;

  const cycleLevel = (delta: number) => {
    const next = Math.max(0, Math.min(data.length - 1, currentIndex + delta));
    setIndex(next);
  };

  // Dimensions matching the 32px inner visualizer box
  const width = 320;
  const height = 32;
  const padding = { top: 4, right: 6, bottom: 4, left: 6 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    return padding.left + (index / Math.max(1, data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // Build SVG path
  let pathD = `M ${getX(0)} ${getY(data[0].value)}`;
  for (let i = 1; i < data.length; i++) {
    pathD += ` L ${getX(i)} ${getY(data[i].value)}`;
  }

  const areaD = `${pathD} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${
    padding.top + chartHeight
  } Z`;

  const currentX = getX(displayIndex);
  const currentY = getY(currentPoint.value);

  return (
    <section className="bg-[#16171b] rounded-[22px] p-4 transition-all duration-200 shadow-xl flex flex-col justify-between select-none min-w-0 w-full group border-none">
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-1 min-w-0">
        <div className="flex items-center gap-1.5 text-zinc-200 font-medium text-[13px] tracking-tight">
          {icon}
          <span className="truncate uppercase font-sans font-semibold tracking-wide text-zinc-300">
            {title}
          </span>
          <span
            className="w-3.5 h-3.5 rounded-full bg-[#1e1f25] text-[9px] flex items-center justify-center text-zinc-400 cursor-help shrink-0 border-none select-none"
            title={infoTooltip || (language === 'es' ? 'Proyección según nivel' : 'Progression by level')}
          >
            i
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-md bg-[#1e1f25] text-zinc-300 font-mono text-[11px] font-semibold tracking-tight shrink-0 border-none">
          {language === 'es' ? `Niv. ${currentPoint.level}` : `Lv. ${currentPoint.level}`}
        </span>
      </div>

      {/* 2. Metric Stat Headline */}
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span
          className="text-3xl font-extrabold text-white tracking-tight leading-none font-sans font-mono"
          style={{ color: hoveredIndex !== null ? color : undefined }}
        >
          {valueFormatter(currentVal)}
        </span>
        <span className="text-xs font-semibold text-zinc-400 flex items-center gap-0.5">
          {diffFromBase > 0 ? (
            <span className="text-[#22c55e] font-mono font-bold flex items-center gap-0.5">
              <svg className="w-3 h-3 text-[#22c55e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +{valueFormatter(diffFromBase)}
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

      {/* 3. Obsidian Area Curve Visualizer (Matching 32px barcode visualizer) */}
      <div className="w-full bg-[#121316] p-2.5 rounded-xl border-none mb-3 relative overflow-hidden flex items-center justify-center">
        <div className="h-[32px] w-full flex items-center">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-[32px] overflow-visible block"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.38" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path d={areaD} fill={`url(#${gradientId})`} />

            {/* Stroke path */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Subtle hairline guide at current position */}
            <line
              x1={currentX}
              y1={padding.top}
              x2={currentX}
              y2={padding.top + chartHeight}
              stroke={color}
              strokeOpacity="0.35"
              strokeDasharray="2 2"
              strokeWidth="1"
            />

            {/* Active level dot */}
            <circle
              cx={currentX}
              cy={currentY}
              r="3.5"
              fill={color}
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Transparent hover hit boxes */}
            {data.map((point, idx) => {
              const cx = getX(idx);
              const cy = getY(point.value);
              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onClick={() => setIndex(idx)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. Bottom Carousel Row: Level Name + Controls + Delta */}
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

        {/* Base & Growth */}
        <div className="flex items-center gap-1.5 text-zinc-300 text-[12px] font-medium font-mono">
          <span className="text-zinc-400">{language === 'es' ? 'Base:' : 'Base:'} {valueFormatter(minVal)}</span>
          <span className="text-zinc-500 font-bold">•</span>
          <span className="text-[#22c55e] font-semibold">+{totalGrowthPercent}%</span>
        </div>
      </div>
    </section>
  );
};
