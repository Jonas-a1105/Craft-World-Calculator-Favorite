import React, { useState, useMemo } from 'react';
import { formatNumber, formatCompactNumber } from '../../../../utils/formatters';
import {
  AltArrowDownBold,
  Buildings2BoldDuotone,
  CheckCircleBold,
  ClockCircleBold,
  Routing2BoldDuotone,
} from 'solar-icon-set';

export interface HomeWeeklySplineCardProps {
  language: string;
  basePower?: number;
}

interface DayMetric {
  dayEs: string;
  dayEn: string;
  arrow: 'up' | 'down';
  amount: number;
  x: number;
  y: number;
  aov: number;
  targetMet: boolean;
}

type ScopeType = 'global' | 'factories' | 'mines';

export const HomeWeeklySplineCard: React.FC<HomeWeeklySplineCardProps> = ({
  language,
  basePower = 100,
}) => {
  const isEs = language === 'es';
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(2); // Default Wednesday
  const [scope, setScope] = useState<ScopeType>('global');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Scaled production datasets across the week
  const regionalData: Record<ScopeType, DayMetric[]> = useMemo(() => {
    const scaleFactor = Math.max(1, basePower / 50);

    return {
      global: [
        { dayEs: 'Lun', dayEn: 'Mon', arrow: 'up', amount: Math.round(380000 * scaleFactor), x: 50, y: 85, aov: 45, targetMet: true },
        { dayEs: 'Mar', dayEn: 'Tue', arrow: 'up', amount: Math.round(420000 * scaleFactor), x: 150, y: 70, aov: 48, targetMet: true },
        { dayEs: 'Mié', dayEn: 'Wed', arrow: 'up', amount: Math.round(490000 * scaleFactor), x: 250, y: 40, aov: 52, targetMet: true },
        { dayEs: 'Jue', dayEn: 'Thu', arrow: 'down', amount: Math.round(310000 * scaleFactor), x: 350, y: 110, aov: 42, targetMet: false },
        { dayEs: 'Vie', dayEn: 'Fri', arrow: 'up', amount: Math.round(460000 * scaleFactor), x: 450, y: 55, aov: 50, targetMet: true },
        { dayEs: 'Sáb', dayEn: 'Sat', arrow: 'down', amount: Math.round(210000 * scaleFactor), x: 550, y: 155, aov: 38, targetMet: false },
        { dayEs: 'Dom', dayEn: 'Sun', arrow: 'down', amount: Math.round(180000 * scaleFactor), x: 650, y: 170, aov: 35, targetMet: false },
      ],
      factories: [
        { dayEs: 'Lun', dayEn: 'Mon', arrow: 'up', amount: Math.round(290000 * scaleFactor), x: 50, y: 120, aov: 52, targetMet: true },
        { dayEs: 'Mar', dayEn: 'Tue', arrow: 'up', amount: Math.round(340000 * scaleFactor), x: 150, y: 100, aov: 52, targetMet: true },
        { dayEs: 'Mié', dayEn: 'Wed', arrow: 'up', amount: Math.round(410000 * scaleFactor), x: 250, y: 72, aov: 54, targetMet: true },
        { dayEs: 'Jue', dayEn: 'Thu', arrow: 'up', amount: Math.round(430000 * scaleFactor), x: 350, y: 64, aov: 55, targetMet: true },
        { dayEs: 'Vie', dayEn: 'Fri', arrow: 'up', amount: Math.round(520000 * scaleFactor), x: 450, y: 35, aov: 58, targetMet: true },
        { dayEs: 'Sáb', dayEn: 'Sat', arrow: 'down', amount: Math.round(280000 * scaleFactor), x: 550, y: 125, aov: 46, targetMet: false },
        { dayEs: 'Dom', dayEn: 'Sun', arrow: 'down', amount: Math.round(230000 * scaleFactor), x: 650, y: 145, aov: 44, targetMet: false },
      ],
      mines: [
        { dayEs: 'Lun', dayEn: 'Mon', arrow: 'down', amount: Math.round(210000 * scaleFactor), x: 50, y: 150, aov: 38, targetMet: false },
        { dayEs: 'Mar', dayEn: 'Tue', arrow: 'up', amount: Math.round(280000 * scaleFactor), x: 150, y: 125, aov: 40, targetMet: false },
        { dayEs: 'Mié', dayEn: 'Wed', arrow: 'up', amount: Math.round(360000 * scaleFactor), x: 250, y: 95, aov: 45, targetMet: true },
        { dayEs: 'Jue', dayEn: 'Thu', arrow: 'down', amount: Math.round(320000 * scaleFactor), x: 350, y: 110, aov: 42, targetMet: false },
        { dayEs: 'Vie', dayEn: 'Fri', arrow: 'up', amount: Math.round(450000 * scaleFactor), x: 450, y: 60, aov: 49, targetMet: true },
        { dayEs: 'Sáb', dayEn: 'Sat', arrow: 'up', amount: Math.round(470000 * scaleFactor), x: 550, y: 52, aov: 51, targetMet: true },
        { dayEs: 'Dom', dayEn: 'Sun', arrow: 'down', amount: Math.round(340000 * scaleFactor), x: 650, y: 100, aov: 43, targetMet: false },
      ],
    };
  }, [basePower]);

  const days = regionalData[scope];
  const activeDay = days[selectedDayIdx] || days[0];

  // Mathematical Spline curve generation
  const { linePath, areaPath } = useMemo(() => {
    if (days.length === 0) return { linePath: '', areaPath: '' };

    const p0 = days[0];
    let line = `M 0 ${p0.y + 10} C 25 ${p0.y + 7}, 35 ${p0.y}, ${p0.x} ${p0.y}`;

    for (let i = 0; i < days.length - 1; i++) {
      const curr = days[i];
      const next = days[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      line += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }

    const pLast = days[days.length - 1];
    line += ` C ${pLast.x + 25} ${pLast.y + 2}, 680 ${pLast.y + 5}, 700 ${pLast.y + 5}`;
    const area = `${line} L 700 200 L 0 200 Z`;

    return { linePath: line, areaPath: area };
  }, [days]);

  return (
    <div className="w-full bg-[#18181b] rounded-[32px] p-5 sm:p-7 shadow-xl border-none select-none relative overflow-hidden">
      {/* Ambient blue back-glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[340px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header: Title + Scope Selector Dropdown */}
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
            <Routing2BoldDuotone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
              {isEs ? 'Proyección de Producción Semanal' : 'Weekly Production Projection'}
            </h3>
            <span className="text-[11px] text-zinc-400 font-medium">
              {isEs ? 'Rendimiento diario estimado en COIN' : 'Estimated daily earnings in COIN'}
            </span>
          </div>
        </div>

        {/* Scope Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold tracking-tight transition-all cursor-pointer border-none shadow-sm"
          >
            <span>
              {scope === 'global'
                ? isEs ? 'Global' : 'Global'
                : scope === 'factories'
                  ? isEs ? 'Fábricas' : 'Factories'
                  : isEs ? 'Minas' : 'Mines'}
            </span>
            <AltArrowDownBold className="w-3 h-3 text-zinc-400" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-[#16171b] rounded-xl shadow-2xl py-1 z-30 border border-zinc-700/30">
              <button
                type="button"
                onClick={() => {
                  setScope('global');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                  scope === 'global' ? 'text-blue-400 bg-blue-500/10 font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>{isEs ? 'Global' : 'Global'}</span>
                {scope === 'global' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope('factories');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                  scope === 'factories' ? 'text-blue-400 bg-blue-500/10 font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>{isEs ? 'Fábricas' : 'Factories'}</span>
                {scope === 'factories' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope('mines');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                  scope === 'mines' ? 'text-blue-400 bg-blue-500/10 font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>{isEs ? 'Minas' : 'Mines'}</span>
                {scope === 'mines' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spline Area Wave Chart */}
      <div className="relative w-full h-[180px] sm:h-[195px] overflow-hidden -mx-1 relative z-10">
        <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2f70fa" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#183670" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0.0" />
            </linearGradient>
            <filter id="wave-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2f70fa" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Area Fill */}
          <path fill="url(#chart-blue-grad)" d={areaPath} className="transition-all duration-700 ease-out" />

          {/* Line Stroke */}
          <path
            fill="none"
            stroke="#2f70fa"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wave-glow)"
            d={linePath}
            className="transition-all duration-700 ease-out"
          />

          {/* Active Marker Dot */}
          <g transform={`translate(${activeDay.x}, ${activeDay.y})`} className="transition-transform duration-500 ease-out">
            <circle r="12" fill="#2f70fa" fillOpacity="0.25" className="animate-ping" />
            <circle r="5" fill="#ffffff" stroke="#2f70fa" strokeWidth="3" />
          </g>
        </svg>
      </div>

      {/* 7-Day Metric Selector Grid */}
      <div className="mt-2 border-t border-b border-white/[0.06] grid grid-cols-7 relative z-10">
        {days.map((item, idx) => {
          const isSelected = idx === selectedDayIdx;
          return (
            <button
              key={item.dayEs}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              className={`group relative py-3 px-1 flex flex-col items-center justify-center text-center transition-colors cursor-pointer border-none ${
                isSelected ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-center gap-1 text-xs text-zinc-300 font-medium">
                <span>{isEs ? item.dayEs : item.dayEn}</span>
                <span
                  className={`font-black text-[11px] leading-none ${
                    item.arrow === 'up' ? 'text-[#00c950]' : 'text-[#f87171]'
                  }`}
                >
                  {item.arrow === 'up' ? '↑' : '↓'}
                </span>
              </div>
              <div className="mt-1 text-[13px] sm:text-[15px] font-black text-white font-mono tracking-tight">
                {formatCompactNumber(item.amount)}
              </div>
              <div className="text-[10px] text-zinc-500 font-medium leading-tight mt-0.5">
                COIN
              </div>

              {/* White bottom indicator underline */}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Card Footer: Daily Projection & Target Status */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 relative z-10">
        <div>
          <p className="text-xs text-zinc-400 font-normal tracking-wide">
            {isEs ? 'Producción del Día Seleccionado' : 'Selected Day Output'}
          </p>
          <div className="text-white text-base sm:text-lg font-bold tracking-tight mt-1 flex items-baseline">
            <span className="text-sky-400 font-mono mr-1.5">
              {isEs ? activeDay.dayEs : activeDay.dayEn}:
            </span>
            <span className="font-mono font-black text-white">
              +{formatNumber(activeDay.amount)} COIN
            </span>
            <span className="text-zinc-500 font-normal text-xs ml-2 font-mono">
              (~{formatCompactNumber(Math.round(activeDay.amount / 24))} COIN/h)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeDay.targetMet ? (
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold tracking-tight flex items-center gap-1.5">
              <CheckCircleBold className="w-3.5 h-3.5" />
              <span>{isEs ? 'Meta Alcanzada' : 'Target Achieved'}</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold tracking-tight flex items-center gap-1.5">
              <ClockCircleBold className="w-3.5 h-3.5" />
              <span>{isEs ? 'Objetivo Pendiente' : 'Pending Goal'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
