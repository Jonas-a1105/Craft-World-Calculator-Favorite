import React, { useState } from 'react';
import { formatCompact } from '../utils/formatters';

export interface DataPoint {
  level: number;
  value: number;
}

interface Props {
  title: string;
  data: DataPoint[];
  color: string;
  gradientId: string;
  isStepped?: boolean;
  valueFormatter?: (val: number) => string;
}

export const MiniMetricChart: React.FC<Props> = ({
  title,
  data,
  color,
  gradientId,
  isStepped = false,
  valueFormatter = formatCompact,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  if (data.length === 0) return null;

  const width = 360;
  const height = 150;
  const padding = { top: 20, right: 30, bottom: 25, left: 15 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value), minVal + 1);

  const getX = (index: number) => {
    return padding.left + (index / Math.max(1, data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // Generate path
  let pathD = '';
  if (isStepped) {
    pathD = `M ${getX(0)} ${getY(data[0].value)}`;
    for (let i = 1; i < data.length; i++) {
      const prevX = getX(i - 1);
      const currX = getX(i);
      const prevY = getY(data[i - 1].value);
      const currY = getY(data[i].value);
      pathD += ` L ${currX} ${prevY} L ${currX} ${currY}`;
    }
  } else {
    pathD = `M ${getX(0)} ${getY(data[0].value)}`;
    for (let i = 1; i < data.length; i++) {
      pathD += ` L ${getX(i)} ${getY(data[i].value)}`;
    }
  }

  const areaD = `${pathD} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${
    padding.top + chartHeight
  } Z`;

  const lastPoint = data[data.length - 1];
  const lastX = getX(data.length - 1);
  const lastY = getY(lastPoint.value);

  // Axis ticks
  const tickIndices = [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1];

  return (
    <div className="bg-[#18181c] rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-5 flex flex-col justify-between shadow-xl border-none relative overflow-hidden select-none w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between mb-2 min-w-0 gap-2">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
          {title}
        </span>
        <span className="text-xs font-mono font-bold shrink-0" style={{ color }}>
          {valueFormatter(lastPoint.value)}
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-hidden block"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Max point dot */}
          <circle cx={lastX} cy={lastY} r="4.5" fill={color} className="animate-pulse" />

          {/* Hover interactive markers */}
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
                className="cursor-pointer hover:stroke-white hover:stroke-2"
                onMouseEnter={() => setHoveredPoint(point)}
              />
            );
          })}

          {/* X Axis ticks */}
          {tickIndices.map((idx, i) => {
            const pt = data[idx];
            if (!pt) return null;
            const x = getX(idx);
            return (
              <text
                key={i}
                x={x}
                y={height - 2}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontFamily="monospace"
              >
                {pt.level}
              </text>
            );
          })}

          {/* Min Y label */}
          <text
            x={width - 5}
            y={padding.top + chartHeight - 2}
            textAnchor="end"
            fontSize="10"
            fill="#64748b"
            fontFamily="monospace"
          >
            {valueFormatter(minVal)}
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#121215] text-white px-2.5 py-1 rounded-full text-[11px] font-mono shadow-xl border-none pointer-events-none flex items-center gap-1.5 z-10">
            <span className="text-slate-400">Lv {hoveredPoint.level}:</span>
            <span style={{ color }} className="font-bold">
              {valueFormatter(hoveredPoint.value)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
