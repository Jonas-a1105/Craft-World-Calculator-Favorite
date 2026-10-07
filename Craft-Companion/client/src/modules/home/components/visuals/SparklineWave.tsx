import React from 'react';

export interface SparklineWaveProps {
  color?: string;
  width?: number;
  height?: number;
}

export const SparklineWave: React.FC<SparklineWaveProps> = ({
  color = '#22c55e',
  width = 60,
  height = 30,
}) => {
  const pathD = 'M 2 20 C 12 20, 16 6, 26 16 C 36 26, 42 3, 50 12 C 54 18, 56 12, 58 14';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
    >
      <defs>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={color} floodOpacity="0.45" />
        </filter>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#neonGlow)"
      />
    </svg>
  );
};
