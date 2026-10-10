import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { FactoryCycleResult } from '../../../services/craftworldCalculations';
import type { ComparisonVerdict } from '../types';
import { formatNumber, formatCompactNumber } from '../../../utils/formatters';

export interface CompareHatchChartCardProps {
  cycle1: FactoryCycleResult;
  cycle2: FactoryCycleResult;
  verdict: ComparisonVerdict;
  language: 'es' | 'en';
}

interface MetricColumn {
  id: string;
  nameEs: string;
  nameEn: string;
  shortEs: string;
  shortEn: string;
  valA: number;
  valB: number;
  unit: string;
  isLowerBetter?: boolean;
}

type ViewFocus = 'vs' | 'optionA' | 'optionB';

export const CompareHatchChartCard: React.FC<CompareHatchChartCardProps> = ({
  cycle1,
  cycle2,
  verdict,
  language,
}) => {
  const isEs = language === 'es';
  const [activeMetricIdx, setActiveMetricIdx] = useState<number>(0);
  const [viewFocus, setViewFocus] = useState<ViewFocus>('vs');
  const [pulseOffset, setPulseOffset] = useState<number>(0);

  // Animated numbers and animated heights state
  const [barHeights, setBarHeights] = useState<number[]>([38, 38, 38, 38, 38]);
  const [displayPcts, setDisplayPcts] = useState<number[]>([0, 0, 0, 0, 0]);
  const [displayDiff, setDisplayDiff] = useState<number>(0);

  const prevPctsRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const prevDiffRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // 5 Canonical Comparison Metrics matching the 5-column chart mockup
  const metrics: MetricColumn[] = useMemo(() => [
    {
      id: 'profit_day',
      nameEs: 'Ganancia Diaria',
      nameEn: 'Daily Profit',
      shortEs: 'Ganancia/d',
      shortEn: 'Profit/d',
      valA: cycle1.profitPerDay,
      valB: cycle2.profitPerDay,
      unit: 'COIN',
    },
    {
      id: 'profit_hour',
      nameEs: 'Ganancia por Hora',
      nameEn: 'Hourly Profit',
      shortEs: 'Ganancia/h',
      shortEn: 'Profit/h',
      valA: cycle1.profitPerHour,
      valB: cycle2.profitPerHour,
      unit: 'COIN',
    },
    {
      id: 'output_day',
      nameEs: 'Volumen de Producción',
      nameEn: 'Production Output',
      shortEs: 'Output/d',
      shortEn: 'Output/d',
      valA: cycle1.outputPerDay,
      valB: cycle2.outputPerDay,
      unit: 'items',
    },
    {
      id: 'input_cost',
      nameEs: 'Costo Insumo / Ciclo',
      nameEn: 'Input Cost / Cycle',
      shortEs: 'Costo Insumo',
      shortEn: 'Input Cost',
      valA: cycle1.inputCostPerCycle,
      valB: cycle2.inputCostPerCycle,
      unit: 'COIN',
      isLowerBetter: true,
    },
    {
      id: 'xp_day',
      nameEs: 'Experiencia Ganada',
      nameEn: 'Experience Earned',
      shortEs: 'XP/d',
      shortEn: 'XP/d',
      valA: cycle1.xpPerDay,
      valB: cycle2.xpPerDay,
      unit: 'XP',
    },
  ], [cycle1, cycle2]);

  const currentMetric = metrics[activeMetricIdx] || metrics[0];
  const valA = currentMetric.valA;
  const valB = currentMetric.valB;

  // Compute Advantage / Delta
  let winnerOption: 'A' | 'B' | 'TIE' = 'TIE';
  let percentAdvantage = 0;
  const absDiff = Math.abs(valA - valB);

  if (currentMetric.isLowerBetter) {
    if (valA < valB) winnerOption = 'A';
    else if (valB < valA) winnerOption = 'B';
  } else {
    if (valA > valB) winnerOption = 'A';
    else if (valB > valA) winnerOption = 'B';
  }

  const baseForPct = Math.min(Math.abs(valA), Math.abs(valB));
  if (baseForPct > 0) {
    percentAdvantage = Math.round((absDiff / baseForPct) * 100);
  } else if (absDiff > 0) {
    percentAdvantage = 100;
  }

  // Target percentages for each column
  const targetPcts = useMemo(() => {
    return metrics.map((m) => {
      if (viewFocus === 'optionA') {
        return m.valA + m.valB > 0 ? Math.round((m.valA / (m.valA + m.valB)) * 100) : 50;
      }
      if (viewFocus === 'optionB') {
        return m.valA + m.valB > 0 ? Math.round((m.valB / (m.valA + m.valB)) * 100) : 50;
      }
      // VS mode: advantage percentage of the leading option
      const sum = Math.abs(m.valA) + Math.abs(m.valB);
      if (sum === 0) return 50;
      const lead = Math.max(Math.abs(m.valA), Math.abs(m.valB));
      return Math.min(100, Math.round((lead / sum) * 100));
    });
  }, [metrics, viewFocus]);

  // Target heights calculation with spring physics support
  const targetHeights = useMemo(() => {
    return targetPcts.map((pct, idx) => {
      const isSelected = idx === activeMetricIdx;
      // Active column receives extra elevation boost
      const elevationBoost = isSelected ? 30 : 0;
      // Pulse perturbation offset
      const pulsePerturb = pulseOffset !== 0 ? Math.sin(idx + pulseOffset) * 16 : 0;
      const rawHeight = Math.round((pct / 100) * 145) + 38 + elevationBoost + pulsePerturb;
      return Math.min(185, Math.max(38, rawHeight));
    });
  }, [targetPcts, activeMetricIdx, pulseOffset]);

  // Smooth numerical counter interpolation using Quart Ease-Out (from mockup animateTextNumber)
  useEffect(() => {
    const startPcts = [...prevPctsRef.current];
    const endPcts = [...targetPcts];
    const startDiff = prevDiffRef.current;
    const endDiff = absDiff;
    const duration = 650;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease Out Quart: 1 - (1 - progress)^4
      const ease = 1 - Math.pow(1 - progress, 4);

      const nextPcts = endPcts.map((target, idx) => {
        const start = startPcts[idx] || 0;
        return Math.round(start + (target - start) * ease);
      });
      setDisplayPcts(nextPcts);

      const nextDiff = Math.round(startDiff + (endDiff - startDiff) * ease);
      setDisplayDiff(nextDiff);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        prevPctsRef.current = endPcts;
        prevDiffRef.current = endDiff;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetPcts, absDiff]);

  // Fluid spring height update
  useEffect(() => {
    // Initial mount delay for initial spring entry
    const timer = setTimeout(() => {
      setBarHeights(targetHeights);
    }, 40);
    return () => clearTimeout(timer);
  }, [targetHeights]);

  // Trigger simulated pulse matching the mockup's "triggerSimulatedPulse"
  const triggerSimulatedPulse = () => {
    setPulseOffset((prev) => prev + 1.25);
    setTimeout(() => {
      setPulseOffset(0);
    }, 700);
  };

  return (
    <div className="w-full bg-[#18181b] rounded-[34px] p-6 sm:p-8 shadow-2xl relative overflow-hidden select-none border-none">
      {/* Ambient Depth Glows */}
      <div className="absolute -top-28 -left-28 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-9 items-stretch relative z-10">
        {/* Left Column (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          <div>
            {/* Header: Sparkline Icon & Title */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#1d1f25] flex items-center justify-center text-zinc-300 shadow-sm shrink-0">
                <svg
                  className="w-5 h-5 text-sky-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight tracking-tight text-white font-title">
                  {isEs ? 'Tendencias de Rendimiento' : 'Performance Trends'}
                </h3>
                <span className="text-xs text-zinc-400 font-medium">
                  {cycle1.row.token} vs {cycle2.row.token}
                </span>
              </div>
            </div>

            {/* View Mode Selector Tabs (VS / Option A / Option B) matching mockup crypto-btns */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setViewFocus('vs')}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border-none shadow-sm ${
                  viewFocus === 'vs'
                    ? 'bg-white text-black font-black'
                    : 'bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                Frente a Frente
              </button>
              <button
                type="button"
                onClick={() => setViewFocus('optionA')}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border-none shadow-sm ${
                  viewFocus === 'optionA'
                    ? 'bg-sky-400 text-black font-black'
                    : 'bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {cycle1.row.token} (A)
              </button>
              <button
                type="button"
                onClick={() => setViewFocus('optionB')}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border-none shadow-sm ${
                  viewFocus === 'optionB'
                    ? 'bg-amber-400 text-black font-black'
                    : 'bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {cycle2.row.token} (B)
              </button>
            </div>

            {/* Metric Selector Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                {isEs ? 'Métrica a Inspeccionar' : 'Metric to Inspect'}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {metrics.map((m, idx) => {
                  const isActive = idx === activeMetricIdx;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveMetricIdx(idx)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer border-none ${
                        isActive
                          ? 'bg-sky-500 text-zinc-950 shadow-md font-black'
                          : 'bg-[#141416] text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      }`}
                    >
                      <span>{isEs ? m.nameEs : m.nameEn}</span>
                      <span
                        className={`text-[10px] font-mono ${
                          isActive ? 'text-zinc-950 font-black' : 'text-zinc-500'
                        }`}
                      >
                        {m.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2">
            {/* Grow Tag with animated pulse dot */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141416] mb-2 text-xs font-semibold text-zinc-300 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {winnerOption === 'TIE'
                  ? isEs
                    ? 'Empate de Rendimiento'
                    : 'Equal Performance'
                  : isEs
                    ? `Ventaja Opción ${winnerOption} (+${percentAdvantage}%)`
                    : `Option ${winnerOption} Lead (+${percentAdvantage}%)`}
              </span>
            </div>

            {/* Big Dynamic Animated Difference Display */}
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
              {winnerOption === 'TIE'
                ? '0.00'
                : `+${formatCompactNumber(displayDiff)}`}
              <span className="text-sm font-semibold text-zinc-400 ml-1.5">
                {currentMetric.unit}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-mono mt-0.5 block truncate">
              {isEs ? currentMetric.nameEs : currentMetric.nameEn}:{' '}
              <span className="text-sky-400 font-bold">A: {formatCompactNumber(valA)}</span> vs{' '}
              <span className="text-amber-400 font-bold">B: {formatCompactNumber(valB)}</span>
            </span>
          </div>
        </div>

        {/* Right Column (col-span-8): Chart Drawing Canvas */}
        <div className="lg:col-span-8 bg-[#101114] rounded-[28px] p-5 sm:p-7 flex flex-col justify-between shadow-xl relative border-none">
          {/* Comparison Header & Dual Numerical Values */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h4 className="text-[15px] font-semibold text-zinc-100 tracking-tight">
                {isEs ? 'Comparación Frente a Frente' : 'Side-by-Side Comparison'}
              </h4>
              <span className="text-xs text-zinc-400">
                {isEs ? 'Modo reactivo con física de resortes elásticos' : 'Reactive spring dynamic physics'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-sky-400">
                {cycle1.row.token} (Nv. {cycle1.row.level}): {formatCompactNumber(valA)}
              </div>
              <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                {cycle2.row.token} (Nv. {cycle2.row.level}): {formatCompactNumber(valB)}
              </div>
            </div>
          </div>

          {/* Chart Drawing Canvas Area with Y-Axis */}
          <div className="relative w-full h-[220px] flex">
            {/* Y-Axis Labels */}
            <div className="w-9 h-full flex flex-col justify-between text-right pr-3 text-[11px] font-mono text-zinc-500 select-none pb-6">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Chart Bars Container with Horizontal Dashed Gridlines */}
            <div className="relative flex-1 h-full pb-6">
              {/* Horizontal Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                <div className="w-full border-b border-dashed border-[#20222a]" />
                <div className="w-full border-b border-dashed border-[#20222a]" />
                <div className="w-full border-b border-dashed border-[#20222a]" />
                <div className="w-full border-b border-dashed border-[#20222a]" />
                <div className="w-full border-b border-[#2b2d38]" />
              </div>

              {/* 5 Column Elements with Fluid Spring Transitions */}
              <div className="relative z-10 w-full h-full flex items-end justify-between px-1 sm:px-3">
                {metrics.map((m, idx) => {
                  const isActive = idx === activeMetricIdx;
                  const currentHeight = barHeights[idx] || 38;
                  const displayPct = displayPcts[idx] || 0;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setActiveMetricIdx(idx)}
                      className="flex flex-col items-center justify-end h-full relative cursor-pointer group w-[54px] sm:w-[68px]"
                    >
                      {/* Tooltip on Top */}
                      <div
                        className={`absolute -top-7 text-[11px] font-mono font-bold text-white tracking-wider transition-all duration-300 pointer-events-none ${
                          isActive
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
                        }`}
                      >
                        {displayPct}%
                      </div>

                      {/* Bar Frame with Spring Height & Dashed border for active */}
                      <div
                        className={`relative w-full flex flex-col items-center frame-transition p-1 sm:p-1.5 rounded-2xl ${
                          isActive
                            ? 'border-2 border-dashed border-[#38bdf8] bg-[#1a1c22]/50'
                            : 'border border-transparent'
                        }`}
                      >
                        <div
                          className={`w-full rounded-[18px] bar-spring relative flex flex-col justify-between items-center py-2.5 overflow-hidden ${
                            isActive
                              ? 'border-2 border-[#38bdf8] bar-hatch-active neon-cyan-glow'
                              : 'border border-[#525767] bar-hatch-inactive group-hover:border-zinc-300'
                          }`}
                          style={{ height: `${currentHeight}px` }}
                        >
                          <div
                            className={`w-6 sm:w-7 h-[2px] rounded-full transition-colors duration-200 ${
                              isActive ? 'bg-[#38bdf8]' : 'bg-[#525767] group-hover:bg-zinc-300'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-mono transition-colors duration-200 select-none ${
                              isActive ? 'text-white font-bold' : 'text-zinc-300 font-semibold'
                            }`}
                          >
                            {displayPct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Column Labels */}
          <div className="flex pl-9 pr-1 sm:pr-3 justify-between text-[11px] font-semibold text-zinc-400 pt-1 select-none">
            {metrics.map((m) => (
              <div key={m.id} className="w-[54px] sm:w-[68px] text-center truncate">
                {isEs ? m.shortEs : m.shortEn}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Footer with interactive simulation button */}
      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {isEs
              ? 'Física de resorte cúbica activa con interpolación en tiempo real'
              : 'Active spring interpolation with real-time numeric animation'}
          </span>
        </div>
        <button
          type="button"
          onClick={triggerSimulatedPulse}
          className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer font-bold transition-colors bg-sky-500/10 px-3 py-1 rounded-full border-none"
        >
          {isEs ? '⚡ Simular variación dinámica' : '⚡ Simulate dynamic pulse'}
        </button>
      </div>
    </div>
  );
};
