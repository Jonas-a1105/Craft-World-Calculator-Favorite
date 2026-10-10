import React, { useState, useMemo } from 'react';
import type { ValuedInventoryItem } from '../types';
import { formatNumber, formatCompactNumber } from '../../../utils/formatters';
import {
  AltArrowLeftBold,
  AltArrowRightBold,
  Chart2BoldDuotone,
  PieChartBoldDuotone,
  LayersBoldDuotone,
} from 'solar-icon-set';

export interface InventoryExecutiveAnalyticsCardProps {
  items: ValuedInventoryItem[];
  totalValue: number;
  language: string;
}

export const InventoryExecutiveAnalyticsCard: React.FC<InventoryExecutiveAnalyticsCardProps> = ({
  items,
  totalValue,
  language,
}) => {
  const isEs = language === 'es';
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(0);
  const [highlightedSegment, setHighlightedSegment] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all');

  // Categories definition
  const categories = useMemo(() => [
    {
      id: 'raw',
      nameEs: 'Materias Primas',
      nameEn: 'Raw Materials',
      tokens: ['Earth', 'Water', 'Oil', 'Sulfur', 'Stone', 'Sand', 'Coal'],
      trend: '+4.2%',
    },
    {
      id: 'refined',
      nameEs: 'Materiales Refinados',
      nameEn: 'Refined Materials',
      tokens: ['Mud', 'Clay', 'Cement', 'Brick', 'Plastics', 'Glass', 'Lumber'],
      trend: '+2.8%',
    },
    {
      id: 'advanced',
      nameEs: 'Metales e Industria',
      nameEn: 'Metals & Industry',
      tokens: ['Copper', 'Steel', 'Wire', 'Beam', 'Nail', 'Bolts', 'Screws'],
      trend: '+6.1%',
    },
    {
      id: 'energy',
      nameEs: 'Energía & Combustibles',
      nameEn: 'Energy & Fuels',
      tokens: ['Energy', 'Fuel', 'Gas', 'Hydrogen', 'Oxygen', 'Heat', 'Steam'],
      trend: '+1.5%',
    },
  ], []);

  const currentCategory = categories[activeCategoryIdx] || categories[0];

  // Calculate items in current category
  const categoryItems = useMemo(() => {
    return items.filter((item) =>
      currentCategory.tokens.some((tok) => tok.toLowerCase() === item.symbol.toLowerCase())
    );
  }, [items, currentCategory]);

  const categoryValue = useMemo(() => {
    return categoryItems.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
  }, [categoryItems]);

  const categoryPct = totalValue > 0 ? Math.min(100, Math.round((categoryValue / totalValue) * 100)) : 25;

  // Compute 3 tiers for the SVG donut chart
  const tierData = useMemo(() => {
    // 3 Tiers breakdown
    let t1Val = 0;
    let t2Val = 0;
    let t3Val = 0;

    items.forEach((it, idx) => {
      if (idx < 5) t1Val += it.totalValue || 0;
      else if (idx < 15) t2Val += it.totalValue || 0;
      else t3Val += it.totalValue || 0;
    });

    const sum = Math.max(1, t1Val + t2Val + t3Val);
    const p1 = Math.round((t1Val / sum) * 100);
    const p2 = Math.round((t2Val / sum) * 100);
    const p3 = Math.max(0, 100 - p1 - p2);

    return {
      t1: { nameEs: 'Nivel Alto (Top 5)', nameEn: 'High Value (Top 5)', val: t1Val, pct: p1, color: '#ff6200' },
      t2: { nameEs: 'Nivel Medio (Intermedios)', nameEn: 'Mid Tier (Core)', val: t2Val, pct: p2, color: '#f59e0b' },
      t3: { nameEs: 'Nivel Base (Volumen)', nameEn: 'Base Tier (Bulk)', val: t3Val, pct: p3, color: '#14b8a6' },
    };
  }, [items]);

  // SVG Donut geometry: radius 42 => circumference ~ 263.89
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const strokeWidth = 12;
  const visualGap = 6;
  const GAP_ARC = strokeWidth + visualGap; // 18 arc units per gap to allow strokeLinecap="round" with clear separation

  const donutSegments = useMemo(() => {
    const rawTiers: Array<{
      id: 'tier1' | 'tier2' | 'tier3';
      pct: number;
      color: string;
      nameEs: string;
      nameEn: string;
    }> = [
      { id: 'tier1', pct: tierData.t1.pct, color: '#ff6200', nameEs: tierData.t1.nameEs, nameEn: tierData.t1.nameEn },
      { id: 'tier2', pct: tierData.t2.pct, color: '#f59e0b', nameEs: tierData.t2.nameEs, nameEn: tierData.t2.nameEn },
      { id: 'tier3', pct: tierData.t3.pct, color: '#14b8a6', nameEs: tierData.t3.nameEs, nameEn: tierData.t3.nameEn },
    ];

    const active = rawTiers.filter((t) => t.pct > 0);
    if (active.length === 0) return [];

    const totalGap = active.length > 1 ? active.length * GAP_ARC : 0;
    const availableArc = Math.max(0, circumference - totalGap);
    const totalPct = active.reduce((acc, t) => acc + t.pct, 0) || 100;

    let accumulatedArc = active.length > 1 ? GAP_ARC / 2 : 0;

    return active.map((tier) => {
      const dashLen = Math.max(1, (tier.pct / totalPct) * availableArc);
      const offset = -accumulatedArc;
      accumulatedArc += dashLen + (active.length > 1 ? GAP_ARC : 0);

      return {
        ...tier,
        dashLen,
        offset,
      };
    });
  }, [tierData, circumference, GAP_ARC]);

  // 30 Dynamic Barcode Bars
  const barcodeBars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, idx) => {
      const it = items[idx % items.length];
      const ratio = it ? Math.min(1, Math.max(0.15, it.totalValue / (items[0]?.totalValue || 1))) : (idx % 5 + 2) / 8;
      const heightPx = Math.max(8, Math.round(ratio * 30));
      const isOrange = idx < 12 || (idx % 3 === 0);
      return { heightPx, isOrange };
    });
  }, [items]);

  const cycleCategory = (dir: number) => {
    setActiveCategoryIdx((prev) => (prev + dir + categories.length) % categories.length);
  };

  return (
    <div className="w-full bg-[#18181b] rounded-[32px] p-5 sm:p-7 shadow-xl border-none select-none relative overflow-hidden">
      {/* Ambient Radial Carbon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-orange-600/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Layout: Left Section (Category & Barcode) + Right Section (Donut & Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 relative z-10 items-stretch">
        
        {/* Section 1: Product Categories & Segmented Barcode (from mockup) */}
        <section className="bg-zinc-800/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border-none shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                  <Chart2BoldDuotone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {isEs ? 'Categorías de Inventario' : 'Inventory Categories'}
                  </h4>
                  <span className="text-[10px] text-zinc-400">
                    {isEs ? 'Composición de volumen y patrimonio' : 'Volume & equity breakdown'}
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-mono font-semibold">
                {currentCategory.tokens.length} {isEs ? 'recursos' : 'resources'}
              </span>
            </div>

            {/* Metric Stat Row */}
            <div className="flex items-baseline gap-2.5 mt-3 mb-3">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none font-mono">
                {categoryPct}%
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                {currentCategory.trend}
                <span className="text-zinc-400 font-normal text-[11px]">
                  {isEs ? 'del valor total' : 'of total value'}
                </span>
              </span>
            </div>

            {/* Segmented Barcode Visualizer (30 individual vertical bars from mockup) */}
            <div className="w-full bg-[#121316] p-2.5 rounded-xl border-none mb-3">
              <div className="flex items-end justify-between gap-[3px] h-[32px] w-full px-0.5">
                {barcodeBars.map((bar, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-sm transition-all duration-300"
                    style={{
                      height: `${bar.heightPx}px`,
                      backgroundColor: bar.isOrange ? '#ff6200' : '#27272a',
                      opacity: bar.isOrange ? 0.95 : 0.6,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Carousel Row: Category Name + Controls + Count */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
            {/* Category Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-200 text-xs sm:text-[13px]">
                {isEs ? currentCategory.nameEs : currentCategory.nameEn}
              </span>
              {/* Carousel Arrows */}
              <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => cycleCategory(-1)}
                  className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded transition-colors cursor-pointer border-none"
                  title="Anterior"
                >
                  <AltArrowLeftBold className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => cycleCategory(1)}
                  className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded transition-colors cursor-pointer border-none"
                  title="Siguiente"
                >
                  <AltArrowRightBold className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Product Count & Total in COIN */}
            <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono font-bold">
              <span>{categoryItems.length} {isEs ? 'ítems' : 'items'}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400">{formatCompactNumber(categoryValue)} COIN</span>
            </div>
          </div>
        </section>

        {/* Section 2: Donut Chart + Breakdown Legend + Acquisition Channels (from mockup) */}
        <section className="bg-zinc-800/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border-none shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <PieChartBoldDuotone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {isEs ? 'Distribución por Niveles de Riqueza' : 'Wealth Tier Distribution'}
                  </h4>
                  <span className="text-[10px] text-zinc-400">
                    {isEs ? 'Concentración de capital en almacén' : 'Inventory capital density'}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-400 font-mono">
                {items.length} {isEs ? 'activos' : 'assets'}
              </span>
            </div>

            {/* Donut Visual + Breakdown Legend */}
            <div className="flex items-center justify-between gap-4 mt-2">
              {/* SVG Donut Chart with separated rounded segments */}
              <div className="relative w-[114px] h-[114px] shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Dark carbon background track ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#22242a"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Dynamic Separated Rounded Segments */}
                  {donutSegments.map((seg) => {
                    const isHovered = highlightedSegment === seg.id;
                    return (
                      <circle
                        key={seg.id}
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={isHovered ? 15 : 12}
                        strokeLinecap="round"
                        strokeDasharray={`${seg.dashLen} ${circumference}`}
                        strokeDashoffset={seg.offset}
                        className="transition-all duration-300 cursor-pointer"
                        style={{
                          filter: isHovered
                            ? `brightness(1.2) drop-shadow(0 0 6px ${seg.color}55)`
                            : 'none',
                        }}
                        onMouseEnter={() => setHighlightedSegment(seg.id)}
                        onMouseLeave={() => setHighlightedSegment('all')}
                      />
                    );
                  })}
                </svg>

                {/* Center Cutout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {highlightedSegment === 'all'
                      ? 'Total'
                      : highlightedSegment === 'tier1'
                        ? 'Top 5'
                        : highlightedSegment === 'tier2'
                          ? 'Mid'
                          : 'Bulk'}
                  </span>
                  <span className="text-xs font-black text-white font-mono">
                    {highlightedSegment === 'all'
                      ? '100%'
                      : highlightedSegment === 'tier1'
                        ? `${tierData.t1.pct}%`
                        : highlightedSegment === 'tier2'
                          ? `${tierData.t2.pct}%`
                          : `${tierData.t3.pct}%`}
                  </span>
                </div>
              </div>

              {/* Segments Metric Legend List */}
              <div className="flex-1 space-y-2 text-xs">
                {/* Row 1: Top 5 */}
                <div
                  className={`flex items-center justify-between p-1.5 px-2 rounded-xl transition-colors cursor-pointer ${
                    highlightedSegment === 'tier1' ? 'bg-orange-500/10' : 'hover:bg-zinc-800'
                  }`}
                  onMouseEnter={() => setHighlightedSegment('tier1')}
                  onMouseLeave={() => setHighlightedSegment('all')}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff6200] shrink-0" />
                    <span className="font-semibold text-zinc-200 text-xs">
                      {isEs ? tierData.t1.nameEs : tierData.t1.nameEn}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white">{tierData.t1.pct}%</span>
                </div>

                {/* Row 2: Mid Tier */}
                <div
                  className={`flex items-center justify-between p-1.5 px-2 rounded-xl transition-colors cursor-pointer ${
                    highlightedSegment === 'tier2' ? 'bg-amber-500/10' : 'hover:bg-zinc-800'
                  }`}
                  onMouseEnter={() => setHighlightedSegment('tier2')}
                  onMouseLeave={() => setHighlightedSegment('all')}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                    <span className="font-semibold text-zinc-200 text-xs">
                      {isEs ? tierData.t2.nameEs : tierData.t2.nameEn}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white">{tierData.t2.pct}%</span>
                </div>

                {/* Row 3: Bulk Tier */}
                <div
                  className={`flex items-center justify-between p-1.5 px-2 rounded-xl transition-colors cursor-pointer ${
                    highlightedSegment === 'tier3' ? 'bg-teal-500/10' : 'hover:bg-zinc-800'
                  }`}
                  onMouseEnter={() => setHighlightedSegment('tier3')}
                  onMouseLeave={() => setHighlightedSegment('all')}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6] shrink-0" />
                    <span className="font-semibold text-zinc-200 text-xs">
                      {isEs ? tierData.t3.nameEs : tierData.t3.nameEn}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white">{tierData.t3.pct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Channel Bar (Storage Channels from mockup) - Rounded separated pills */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
              <span className="text-zinc-300 font-semibold">{isEs ? 'Canales de Depósito' : 'Storage Channels'}</span>
              <span className="font-mono text-zinc-300 font-bold">{formatNumber(totalValue)} COIN</span>
            </div>

            {/* Segmented Horizontal Pill Bar - fully rounded individual pills with clear gap */}
            <div className="w-full flex items-center gap-2">
              <div
                className="h-2.5 sm:h-3 bg-[#ff6200] rounded-full transition-all duration-500 shadow-sm min-w-[12px] hover:brightness-110"
                style={{ width: '58%' }}
                title={`${isEs ? 'Almacén Principal' : 'Main Storage'}: 58%`}
              />
              <div
                className="h-2.5 sm:h-3 bg-[#f59e0b] rounded-full transition-all duration-500 shadow-sm min-w-[12px] hover:brightness-110"
                style={{ width: '28%' }}
                title={`${isEs ? 'Fábricas y Talleres' : 'Factories & Workshops'}: 28%`}
              />
              <div
                className="h-2.5 sm:h-3 bg-[#14b8a6] rounded-full transition-all duration-500 shadow-sm min-w-[12px] hover:brightness-110"
                style={{ width: '14%' }}
                title={`${isEs ? 'Minas y Terrenos' : 'Mines & Plots'}: 14%`}
              />
            </div>

            {/* Sub-row Legend matching mockup */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium pt-0.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff6200] shrink-0" />
                <span className="text-zinc-300">{isEs ? 'Almacén' : 'Storage'} <span className="text-zinc-500 ml-0.5 font-mono">58%</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
                <span className="text-zinc-300">{isEs ? 'Fábricas' : 'Factories'} <span className="text-zinc-500 ml-0.5 font-mono">28%</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#14b8a6] shrink-0" />
                <span className="text-zinc-300">{isEs ? 'Minas' : 'Mines'} <span className="text-zinc-500 ml-0.5 font-mono">14%</span></span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
