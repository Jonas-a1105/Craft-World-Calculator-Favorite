import React, { useState, useMemo } from 'react';
import {
  useCoinChart,
  formatCoinPrice,
  formatPriceChange,
  type ChartTimeframe,
  type CoinChartPoint,
  type CoinMarketData,
} from '../../../../../services/coinPriceService';
import { MetricCard } from '../../../../ui/primitives';
import { useTranslation } from '../../../../../utils/i18n';

interface CoinMarketTabProps {
  marketData?: CoinMarketData | null;
  basePrice: number | null;
  isRefreshingPrice: boolean;
}

const TIMEFRAMES: ChartTimeframe[] = ['1H', '24H', '7D', '30D', 'ALL'];

export const CoinMarketTab: React.FC<CoinMarketTabProps> = ({
  marketData,
  basePrice,
  isRefreshingPrice,
}) => {
  const { language } = useTranslation();
  const isEs = language === 'es';
  const [activeTimeframe, setActiveTimeframe] = useState<ChartTimeframe>('24H');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { data: chartPoints = [], isLoading: isLoadingChart } = useCoinChart(
    activeTimeframe,
    basePrice ?? 0,
  );

  // Chart SVG geometry & scaling
  const svgMetrics = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) {
      return {
        polylinePoints: '',
        areaPoints: '',
        coords: [],
      };
    }

    const prices = chartPoints.map((p) => p.price);
    const minRaw = Math.min(...prices);
    const maxRaw = Math.max(...prices);
    const padding = (maxRaw - minRaw) * 0.1 || minRaw * 0.05 || 0.00001;
    const minPrice = Math.max(0.00001, minRaw - padding);
    const maxPrice = maxRaw + padding;
    const range = maxPrice - minPrice || 1;

    const width = 600;
    const height = 180;
    const topPad = 15;
    const bottomPad = 25;
    const chartH = height - topPad - bottomPad;

    const coords = chartPoints.map((pt, i) => {
      const x = (i / Math.max(1, chartPoints.length - 1)) * width;
      const normalizedY = (pt.price - minPrice) / range;
      const y = height - bottomPad - normalizedY * chartH;
      return { x, y, pt };
    });

    const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const areaPoints = `0,${height - bottomPad} ${polylinePoints} ${width},${height - bottomPad}`;

    return {
      polylinePoints,
      areaPoints,
      coords,
    };
  }, [chartPoints]);

  const activePoint: CoinChartPoint | null =
    hoveredIndex !== null && chartPoints[hoveredIndex] ? chartPoints[hoveredIndex] : null;

  const currentDisplayPrice = activePoint
    ? formatCoinPrice(activePoint.price)
    : basePrice != null
      ? formatCoinPrice(basePrice)
      : '—';

  const priceDiffPercent = useMemo(() => {
    if (chartPoints.length < 2) return marketData?.h24Change ?? 0;
    const first = chartPoints[0].price;
    const last = activePoint ? activePoint.price : chartPoints[chartPoints.length - 1].price;
    if (first <= 0) return 0;
    return ((last - first) / first) * 100;
  }, [chartPoints, activePoint, marketData]);

  const isTrendPositive = priceDiffPercent >= 0;
  const hasMarket = Boolean(marketData && marketData.priceUsd > 0);
  const h24 = formatPriceChange(hasMarket ? marketData!.h24Change : 0);
  const volumeLabel =
    hasMarket && marketData!.volume24h > 0
      ? `$${marketData!.volume24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      : '—';
  const reserveLabel =
    hasMarket && marketData!.reserveUsd > 0
      ? `$${marketData!.reserveUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      : '—';
  const sourceState: 'live' | 'cache' | 'none' = !hasMarket
    ? 'none'
    : marketData!.source === 'live'
      ? 'live'
      : 'cache';

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150">
      {/* Top Stat Pills Row — primitivas compartidas MetricCard (LP1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Card 1: Precio Actual con badge de fuente */}
        <MetricCard
          tone={basePrice != null ? 'amber' : 'zinc'}
          icon={
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                sourceState === 'live'
                  ? 'bg-emerald-400'
                  : sourceState === 'cache'
                    ? 'bg-amber-400'
                    : 'bg-zinc-600'
              }`}
            />
          }
          label={
            sourceState === 'live'
              ? isEs ? 'En Vivo' : 'Live'
              : sourceState === 'cache'
                ? isEs ? 'En Caché' : 'Cached'
                : isEs ? 'Sin Datos' : 'No Data'
          }
          value={basePrice != null ? formatCoinPrice(basePrice) : '—'}
        />

        {/* Card 2: Variación 24H */}
        <MetricCard
          tone={hasMarket ? (h24.isPositive ? 'emerald' : 'rose') : 'zinc'}
          label={isEs ? 'Variación 24h' : '24h Change'}
          value={hasMarket ? h24.text : '—'}
        />

        {/* Card 3: Volumen 24H */}
        <MetricCard
          tone="zinc"
          label={isEs ? 'Volumen 24h' : '24h Volume'}
          value={volumeLabel}
        />

        {/* Card 4: Liquidez en Pool */}
        <MetricCard
          tone="zinc"
          label={isEs ? 'Liquidez en Pool' : 'Pool Liquidity'}
          value={reserveLabel}
        />
      </div>

      {/* Interactive Chart Section */}
      <div className="bg-oled-850 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Historial COIN / WRON</span>
              {isRefreshingPrice && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                {currentDisplayPrice}
              </span>
              <span
                className={`text-xs font-mono font-semibold ${
                  isTrendPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isTrendPositive ? '▲ +' : '▼ '}
                {Math.abs(priceDiffPercent).toFixed(2)}%
              </span>
              {activePoint && (
                <span className="text-[11px] text-zinc-400 font-mono">
                  ({activePoint.timeLabel})
                </span>
              )}
            </div>
          </div>

          {/* Timeframe Filter Pills */}
          <div className="flex items-center gap-1 bg-oled-cardInner p-1 rounded-xl self-start sm:self-auto">
            {TIMEFRAMES.map((tf) => {
              const isSelected = activeTimeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    setActiveTimeframe(tf);
                    setHoveredIndex(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border-0 outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart SVG Canvas */}
        <div className="relative w-full overflow-hidden pt-2">
          {isLoadingChart ? (
            <div className="h-44 sm:h-48 flex items-center justify-center text-xs text-zinc-400">
              Cargando datos de mercado...
            </div>
          ) : chartPoints.length === 0 ? (
            /* Estado honesto: sin historial real, nunca una gráfica sintética */
            <div className="h-44 sm:h-48 flex flex-col items-center justify-center gap-2 text-center text-xs text-zinc-400">
              <span className="text-lg">📉</span>
              <span className="font-semibold text-zinc-400">
                Gráfica no disponible temporalmente
              </span>
              <span className="max-w-[280px] leading-relaxed">
                No se pudo obtener el historial de Katana V3. Reintentando en
                segundo plano…
              </span>
            </div>
          ) : (
            <div className="relative w-full">
              <svg
                className="w-full h-44 sm:h-48 overflow-visible"
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="coinModalChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isTrendPositive ? '#10b981' : '#fbbf24'}
                      stopOpacity="0.32"
                    />
                    <stop
                      offset="70%"
                      stopColor={isTrendPositive ? '#10b981' : '#fbbf24'}
                      stopOpacity="0.08"
                    />
                    <stop
                      offset="100%"
                      stopColor={isTrendPositive ? '#10b981' : '#fbbf24'}
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>

                {/* Horizontal Guideline Dotted Target Line */}
                <line
                  x1="0"
                  y1="90"
                  x2="600"
                  y2="90"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />

                {/* Area fill */}
                {svgMetrics.areaPoints && (
                  <polygon
                    points={svgMetrics.areaPoints}
                    fill="url(#coinModalChartGradient)"
                  />
                )}

                {/* Main Curve */}
                {svgMetrics.polylinePoints && (
                  <polyline
                    points={svgMetrics.polylinePoints}
                    fill="none"
                    stroke={isTrendPositive ? '#10b981' : '#fbbf24'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Hover indicator vertical line & dot */}
                {hoveredIndex !== null && svgMetrics.coords[hoveredIndex] && (
                  <g>
                    <line
                      x1={svgMetrics.coords[hoveredIndex].x}
                      y1="10"
                      x2={svgMetrics.coords[hoveredIndex].x}
                      y2="155"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={svgMetrics.coords[hoveredIndex].x}
                      cy={svgMetrics.coords[hoveredIndex].y}
                      r="4.5"
                      fill="#ffffff"
                      stroke={isTrendPositive ? '#10b981' : '#fbbf24'}
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Hover interaction columns */}
                {svgMetrics.coords.map((c, idx) => {
                  const colW = 600 / Math.max(1, svgMetrics.coords.length);
                  return (
                    <rect
                      key={idx}
                      x={c.x - colW / 2}
                      y="0"
                      width={colW}
                      height="180"
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => setHoveredIndex(idx)}
                    />
                  );
                })}
              </svg>

              {/* Time labels */}
              <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 pt-1 px-1">
                <span>{chartPoints[0]?.timeLabel || 'Inicio'}</span>
                <span>{chartPoints[Math.floor(chartPoints.length / 2)]?.timeLabel || ''}</span>
                <span>{chartPoints[chartPoints.length - 1]?.timeLabel || 'Actual'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
