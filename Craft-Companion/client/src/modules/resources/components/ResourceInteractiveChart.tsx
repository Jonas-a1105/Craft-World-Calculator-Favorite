import React from 'react';
import type { Timeframe, ChartSeriesData, ChartPoint } from '../types';

interface ResourceInteractiveChartProps {
  chartSeries: ChartSeriesData;
  activePoint: ChartPoint | null;
  hoveredIndex: number | null;
  activeTimeframe: Timeframe;
  setActiveTimeframe: (tf: Timeframe) => void;
  handlePointerDown: (e: React.PointerEvent<SVGRectElement>) => void;
  handlePointerMove: (e: React.PointerEvent<SVGRectElement>) => void;
  handlePointerUp: (e: React.PointerEvent<SVGRectElement>) => void;
  handlePointerCancel: () => void;
}

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '1D', '1W', '1M', 'MAX'];

export const ResourceInteractiveChart: React.FC<ResourceInteractiveChartProps> = ({
  chartSeries,
  activePoint,
  hoveredIndex,
  activeTimeframe,
  setActiveTimeframe,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handlePointerCancel,
}) => {
  const { points, polylinePoints, areaPoints } = chartSeries;

  return (
    <div className="relative w-full space-y-4 py-1">
      <div className="relative w-full">
        <svg
          className="w-full h-48 sm:h-56 md:h-64 overflow-visible"
          viewBox="0 0 800 220"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="resourceChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.35" />
              <stop offset="60%" stopColor="rgb(34, 197, 94)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Shaded Area under Curve */}
          <polygon points={areaPoints} fill="url(#resourceChartGradient)" />

          {/* Main Line Curve */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Indicator: Vertical Dashed Line, Indicator Dot, Tooltip */}
          {activePoint ? (
            <g className="transition-opacity duration-150">
              {/* Vertical Dashed Line down to bottom */}
              <line
                x1={activePoint.x}
                y1={activePoint.y}
                x2={activePoint.x}
                y2={220}
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeDasharray="3 3"
                opacity="0.9"
              />

              {/* Shaded trailing area before hover point matching game visual */}
              <polygon
                points={`${points[0].x},220 ${points
                  .slice(0, (hoveredIndex ?? 0) + 1)
                  .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
                  .join(' ')} ${activePoint.x},220`}
                fill="url(#resourceChartGradient)"
                opacity="0.8"
              />

              {/* Green Indicator Dot on Curve */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="rgb(34, 197, 94)"
                stroke="#ffffff"
                strokeWidth="1.8"
              />

              {/* Tooltip text above the point (11:00 AM, Oct 4) */}
              <text
                x={Math.max(65, Math.min(735, activePoint.x))}
                y={Math.max(16, activePoint.y - 12)}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.95)' }}
              >
                {activePoint.timeFormatted}
              </text>
            </g>
          ) : (
            /* End Point Live Dot when not hovering */
            points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4.5"
                fill="rgb(34, 197, 94)"
                className="animate-pulse"
              />
            )
          )}

          {/* Transparent Interactive Scrubbing Overlay */}
          <rect
            x="0"
            y="0"
            width="800"
            height="220"
            fill="transparent"
            className="cursor-pointer select-none touch-none"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />
        </svg>
      </div>

      {/* Timeframe Filter Buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-1 flex-wrap">
        {TIMEFRAMES.map((tf) => {
          const isSelected = activeTimeframe === tf;
          return (
            <button
              key={tf}
              type="button"
              onClick={() => setActiveTimeframe(tf)}
              style={{ padding: 0 }}
              className={`px-3.5 py-1 text-xs font-bold font-mono rounded-full transition-all duration-200 !p-0 select-none border-none ${
                isSelected
                  ? 'bg-[#292930] text-[rgb(34,197,94)] ring-2 ring-[rgb(34,197,94)] shadow-md'
                  : 'bg-[#1c1c20] hover:bg-[#25252b] text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          );
        })}
      </div>
    </div>
  );
};
