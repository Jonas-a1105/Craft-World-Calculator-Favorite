import React from 'react';

export interface MiniBarChartProps {
  activeIndex?: number;
  color?: string;
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  activeIndex = 3,
  color = '#eab308',
}) => {
  const bars = [12, 20, 15, 32, 16, 10];
  const maxH = 34;
  const barW = 3.5;
  const gap = 3.5;

  return (
    <svg width={bars.length * (barW + gap)} height={maxH} className="shrink-0">
      {bars.map((h, i) => {
        const isActive = i === activeIndex;
        const x = i * (barW + gap);
        const y = maxH - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={1.75}
            fill={isActive ? color : 'rgba(255, 255, 255, 0.12)'}
          />
        );
      })}
    </svg>
  );
};
