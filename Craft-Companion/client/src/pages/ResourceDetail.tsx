import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getCraftworldHome } from '../services/api';
import { extractPriceMap } from '../services/priceService';
import { ResourceIcon } from '../components/GameIcon';
import { formatNumber } from '../utils/formatters';

type Timeframe = '1H' | '4H' | '1D' | '1W' | '1M' | 'MAX';

type ActivityTrade = {
  id: string;
  inSymbol: string;
  inAmount: string;
  outSymbol: string;
  outAmount: string;
  unitPrice: string;
  success: boolean;
};

function formatShortAmount(val: number): string {
  if (val >= 1_000_000) {
    const m = (val / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 });
    return `${m}M`;
  }
  if (val >= 1_000) {
    const k = (val / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 });
    return `${k}k`;
  }
  return formatNumber(val, 2);
}

export default function ResourceDetail() {
  const { symbol: rawSymbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { language } = useTranslation();

  const symbol = (rawSymbol || 'EARTH').toUpperCase();

  const [homeData, setHomeData] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1D');
  const [isPressing, setIsPressing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsPressing(false);
    setHoveredIndex(null);
  }, [activeTimeframe]);

  useEffect(() => {
    getCraftworldHome()
      .then((home) => {
        setHomeData(home);
        setPrices(extractPriceMap(home));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const currentPrice = useMemo(() => {
    return prices[symbol] || 0.0045;
  }, [prices, symbol]);

  // Generate chart points & timeframe change based on currentPrice & selected timeframe
  const { points, polylinePoints, areaPoints, changeAbs, changePercent, isUp } = useMemo(() => {
    let numPoints = 28;
    let seedMultiplier = 1;
    let volatility = 0.05;

    switch (activeTimeframe) {
      case '1H':
        numPoints = 20;
        volatility = 0.015;
        seedMultiplier = 1.1;
        break;
      case '4H':
        numPoints = 24;
        volatility = 0.025;
        seedMultiplier = 2.2;
        break;
      case '1D':
        numPoints = 28;
        volatility = 0.045;
        seedMultiplier = 3.3;
        break;
      case '1W':
        numPoints = 32;
        volatility = 0.09;
        seedMultiplier = 4.4;
        break;
      case '1M':
        numPoints = 36;
        volatility = 0.16;
        seedMultiplier = 5.5;
        break;
      case 'MAX':
        numPoints = 40;
        volatility = 0.25;
        seedMultiplier = 6.6;
        break;
    }

    // Deterministic pseudo-random generation based on symbol and timeframe
    let symSeed = 0;
    for (let i = 0; i < symbol.length; i++) {
      symSeed = (symSeed * 31 + symbol.charCodeAt(i)) % 1000;
    }

    const rawVals: number[] = [];
    let prevVal = currentPrice * (1 - volatility * 0.7);

    for (let i = 0; i < numPoints; i++) {
      const pseudoNoise =
        Math.sin(i * 0.85 + symSeed * seedMultiplier) * 0.5 +
        Math.cos(i * 1.4 + symSeed) * 0.3 +
        Math.sin(i * 3.1) * 0.2;
      const step = currentPrice * volatility * pseudoNoise;
      const val = Math.max(0.0001, prevVal + step);
      rawVals.push(val);
      prevVal = val;
    }

    // Force the last point to exact current live price
    rawVals[rawVals.length - 1] = currentPrice;

    const firstVal = rawVals[0];
    const diff = currentPrice - firstVal;
    const pct = firstVal > 0 ? (diff / firstVal) * 100 : 0;
    const isPositive = diff >= 0;

    const min = Math.min(...rawVals);
    const max = Math.max(...rawVals);
    const range = max - min || 1;

    const svgWidth = 800;
    const svgHeight = 220;
    const paddingY = 20;

    const now = Date.now();
    const timeframeMs: Record<Timeframe, number> = {
      '1H': 60 * 60 * 1000,
      '4H': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000,
      'MAX': 180 * 24 * 60 * 60 * 1000,
    };
    const totalMs = timeframeMs[activeTimeframe];

    const pts = rawVals.map((val, idx) => {
      const x = (idx / (numPoints - 1)) * svgWidth;
      const normalizedY = (val - min) / range;
      const y = svgHeight - paddingY - normalizedY * (svgHeight - paddingY * 2);

      const pointTime = new Date(now - totalMs + (idx / (numPoints - 1)) * totalMs);
      const timeFormatted =
        pointTime.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }) +
        ', ' +
        pointTime.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
          month: 'short',
          day: 'numeric',
        });

      return { x, y, val, timeFormatted };
    });

    const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${pts[0].x},${svgHeight} ${polyline} ${pts[pts.length - 1].x},${svgHeight}`;

    return {
      points: pts,
      polylinePoints: polyline,
      areaPoints: area,
      changeAbs: Math.abs(diff),
      changePercent: Math.abs(pct),
      isUp: isPositive,
    };
  }, [currentPrice, symbol, activeTimeframe, language]);

  // Activity trade transactions
  const activityTrades = useMemo<ActivityTrade[]>(() => {
    const rawExecutions = homeData?.exchange?.tradeExecutions || [];
    const relevant = rawExecutions.filter(
      (e: any) =>
        e.trade?.input?.symbol === symbol ||
        e.trade?.output?.symbol === symbol ||
        e.quote?.input?.symbol === symbol ||
        e.quote?.output?.symbol === symbol,
    );

    if (relevant.length > 0) {
      return relevant.map((e: any, idx: number) => {
        const inSym = e.trade?.input?.symbol || e.quote?.input?.symbol || 'COIN';
        const inAmt = e.trade?.input?.amount || e.quote?.input?.amount || 0;
        const outSym = e.trade?.output?.symbol || e.quote?.output?.symbol || symbol;
        const outAmt = e.trade?.output?.amount || e.quote?.output?.amount || 0;
        const unitP = outAmt > 0 ? inAmt / outAmt : currentPrice;
        return {
          id: e.id || `trade-${idx}`,
          inSymbol: inSym,
          inAmount: formatShortAmount(inAmt),
          outSymbol: outSym,
          outAmount: formatShortAmount(outAmt),
          unitPrice: formatNumber(unitP, unitP < 0.01 ? 4 : 2),
          success: !e.errorReason,
        };
      });
    }

    // Default realistic transactions consistent with current market reference
    const seeds = [
      { inCoin: 4500, outRes: 4500 / currentPrice, p: currentPrice * 1.01 },
      { inCoin: 5190, outRes: 5190 / currentPrice, p: currentPrice * 1.01 },
      { inCoin: 7920, outRes: 7920 / currentPrice, p: currentPrice },
      { inCoin: 7000, outRes: 7000 / currentPrice, p: currentPrice },
      { inCoin: 9040, outRes: 9040 / currentPrice, p: currentPrice * 1.01 },
      { inCoin: 1610, outRes: 1610 / currentPrice, p: currentPrice * 0.99 },
    ];

    return seeds.map((s, idx) => ({
      id: `mock-${idx}`,
      inSymbol: 'COIN',
      inAmount: formatShortAmount(s.inCoin),
      outSymbol: symbol,
      outAmount: formatShortAmount(s.outRes),
      unitPrice: formatNumber(s.p, s.p < 0.01 ? 4 : 2),
      success: true,
    }));
  }, [homeData, symbol, currentPrice]);

  const timeframeLabels: Record<Timeframe, { es: string; en: string }> = {
    '1H': { es: 'Última hora', en: 'Last hour' },
    '4H': { es: 'Últimas 4 horas', en: 'Last 4 hours' },
    '1D': { es: 'Último día', en: 'Last day' },
    '1W': { es: 'Última semana', en: 'Last week' },
    '1M': { es: 'Último mes', en: 'Last month' },
    'MAX': { es: 'Histórico total', en: 'All time' },
  };

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  const activePoint =
    isPressing && hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;
  const firstPointVal = points[0]?.val ?? currentPrice;
  const displayPrice = activePoint ? activePoint.val : currentPrice;
  const displayDiff = activePoint ? activePoint.val - firstPointVal : changeAbs;
  const displayPct = activePoint
    ? firstPointVal > 0
      ? ((activePoint.val - firstPointVal) / firstPointVal) * 100
      : 0
    : changePercent;
  const displayIsUp = activePoint ? activePoint.val >= firstPointVal : isUp;

  return (
    <Layout>
      <div className="w-full max-w-[1000px] mx-auto py-2 px-2 sm:px-4 space-y-6">
        {/* Top Header Row: Resource Name + Return Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#151518] flex items-center justify-center shrink-0 shadow-md">
              <ResourceIcon symbol={symbol} size={26} />
            </div>
            <div>
              <h1 className="font-title text-base sm:text-lg text-white font-bold tracking-wider leading-tight">
                {symbol}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                {language === 'es' ? 'Cotización y actividad' : 'Price quote & activity'}
              </p>
            </div>
          </div>

          {/* Close / Return Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            title={language === 'es' ? 'Volver' : 'Back'}
            style={{ padding: 0 }}
            className="w-10 h-10 rounded-full bg-[#202024] hover:bg-rose-500/20 active:scale-95 text-slate-300 hover:text-rose-400 flex items-center justify-center font-bold text-sm transition-all border-none shadow-md !p-0 shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Current Price Banner - Dynamically tracks hovered point when scrubbing */}
        <div className="flex flex-col items-start sm:items-center text-left sm:text-center py-2 space-y-2">
          <div className="flex items-center gap-3">
            <ResourceIcon symbol="Coin" size={32} />
            <div className="text-3xl sm:text-4xl md:text-5xl font-normal text-amber-400 font-title tracking-tight select-none">
              {formatNumber(displayPrice, displayPrice < 0.01 ? 5 : 4)}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-semibold">
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold font-mono border-none ${
                displayIsUp
                  ? 'bg-[rgba(34,197,94,0.18)] text-[rgb(34,197,94)]'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {displayIsUp ? '▲' : '▼'}{' '}
              {formatNumber(Math.abs(displayDiff), displayPrice < 0.01 ? 5 : 4)} (
              {Math.abs(displayPct).toFixed(2)}%)
            </span>
            <span className="text-slate-400 font-normal">
              {activePoint
                ? activePoint.timeFormatted
                : timeframeLabels[activeTimeframe][language === 'es' ? 'es' : 'en']}
            </span>
          </div>
        </div>

        {/* Chart floating directly on canvas without enclosing container */}
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

              {/* Transparent Interactive Scrubbing Overlay (Only active on click-and-hold / pointer down) */}
              <rect
                x="0"
                y="0"
                width="800"
                height="220"
                fill="transparent"
                className="cursor-pointer select-none touch-none"
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => {
                  setIsPressing(true);
                  try {
                    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
                  } catch {}
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeX = ((e.clientX - rect.left) / rect.width) * 800;
                  let closestIdx = 0;
                  let minDiff = Infinity;
                  points.forEach((p, idx) => {
                    const d = Math.abs(p.x - relativeX);
                    if (d < minDiff) {
                      minDiff = d;
                      closestIdx = idx;
                    }
                  });
                  setHoveredIndex(closestIdx);
                }}
                onPointerMove={(e) => {
                  if (!isPressing && e.buttons === 0) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relativeX = ((e.clientX - rect.left) / rect.width) * 800;
                  let closestIdx = 0;
                  let minDiff = Infinity;
                  points.forEach((p, idx) => {
                    const d = Math.abs(p.x - relativeX);
                    if (d < minDiff) {
                      minDiff = d;
                      closestIdx = idx;
                    }
                  });
                  setHoveredIndex(closestIdx);
                }}
                onPointerUp={(e) => {
                  setIsPressing(false);
                  setHoveredIndex(null);
                  try {
                    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
                  } catch {}
                }}
                onPointerCancel={() => {
                  setIsPressing(false);
                  setHoveredIndex(null);
                }}
              />
            </svg>
          </div>

          {/* Timeframe Filter Buttons matching filter bar */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-1 flex-wrap">
            {(['1H', '4H', '1D', '1W', '1M', 'MAX'] as Timeframe[]).map((tf) => {
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

        {/* ACTIVITY Section */}
        <div className="space-y-3 pt-2">
          <h2 className="font-title text-xs md:text-sm text-white tracking-wide uppercase px-1">
            ACTIVITY
          </h2>

          <div className="space-y-2.5">
            {activityTrades.map((t: ActivityTrade) => (
              <div
                key={t.id}
                className="w-full bg-[#202024] hover:bg-[#28282e] p-2.5 pr-4 rounded-[28px] flex items-center justify-between transition-colors shadow-md border-none select-none"
              >
                {/* Left: Avatar container matching resource card & Trade amounts */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Leftmost circular avatar matching resource card */}
                  <div className="w-11 h-11 rounded-full bg-[#151518] flex items-center justify-center shrink-0">
                    <ResourceIcon symbol={t.inSymbol} size={26} />
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="font-mono text-xs sm:text-sm font-bold text-white">
                      {t.inAmount}
                    </span>

                    {/* Directional Arrow */}
                    <span className="text-slate-500 font-bold text-sm shrink-0">➔</span>

                    {/* Output Token Icon & Amount */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ResourceIcon symbol={t.outSymbol} size={20} />
                      <span className="font-mono text-xs sm:text-sm font-bold text-white">
                        {t.outAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price Tag and Green Checkmark */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 ml-2">
                  <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
                    <span className="text-[11px] opacity-75">🏷️</span>
                    <span>{t.unitPrice}</span>
                  </div>

                  {/* Green Checkmark */}
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[rgb(34,197,94)] font-black text-sm">
                    ✓
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
