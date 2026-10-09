import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { extractPriceMap } from '../../../services/priceService';
import type { Timeframe } from '../types';
import {
  generateChartSeries,
  extractActivityTrades,
  TIMEFRAME_LABELS,
} from '../services/resourceDetailService';
import {
  fetchRoninPoolsData,
  buildRealChartSeries,
  type RoninPoolsDataset,
  type PoolResourceItem,
} from '../../../services/roninPoolsService';

export function useResourceDetail() {
  const { symbol: rawSymbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { language } = useTranslation();

  const symbol = (rawSymbol || 'EARTH').toUpperCase();

  const { data: homeData, isLoading: loading } = useCraftworldHomeQuery();
  const [poolsData, setPoolsData] = useState<RoninPoolsDataset | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1D');
  const [isPressing, setIsPressing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchRoninPoolsData().then(setPoolsData);
  }, []);

  useEffect(() => {
    setIsPressing(false);
    setHoveredIndex(null);
  }, [activeTimeframe]);

  const prices = useMemo(() => extractPriceMap(homeData), [homeData]);

  const poolItem: PoolResourceItem | null = useMemo(() => {
    return poolsData?.resources?.[symbol] || null;
  }, [poolsData, symbol]);

  const currentPrice = useMemo(() => {
    // 1. Direct game price list from authentic home payload if available
    const liveList = homeData?.priceList?.prices;
    if (Array.isArray(liveList)) {
      const match = liveList.find((p) => (p.referenceSymbol || '').toUpperCase() === symbol);
      if (match && typeof match.amount === 'number' && match.amount > 0) {
        return match.amount;
      }
    }
    // 2. Real Katana DEX pool average if present and non-zero
    if (poolItem?.price1d?.average && poolItem.price1d.average > 0) {
      return poolItem.price1d.average;
    }
    // 3. Intrinsic fallback dictionary or base price
    if (prices[symbol] !== undefined && prices[symbol] > 0) {
      return prices[symbol];
    }
    return 0.0045;
  }, [homeData, symbol, poolItem, prices]);

  const chartSeries = useMemo(() => {
    if (poolItem) {
      const realSeries = buildRealChartSeries(poolItem, activeTimeframe, currentPrice, language);
      if (realSeries && realSeries.points.length > 1) {
        return realSeries;
      }
    }
    return generateChartSeries(currentPrice, symbol, activeTimeframe, language);
  }, [poolItem, currentPrice, symbol, activeTimeframe, language]);

  const activityTrades = useMemo(() => {
    return extractActivityTrades(homeData?.exchange?.tradeExecutions, symbol, currentPrice);
  }, [homeData, symbol, currentPrice]);

  const { points } = chartSeries;
  const activePoint =
    isPressing && hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;
  const firstPointVal = points.find((p) => p.val > 0)?.val ?? currentPrice;
  const displayPrice = activePoint ? activePoint.val : currentPrice;
  const displayDiff = activePoint ? activePoint.val - firstPointVal : chartSeries.changeAbs;
  const displayPct = activePoint
    ? firstPointVal > 0
      ? ((activePoint.val - firstPointVal) / firstPointVal) * 100
      : 0
    : chartSeries.changePercent;
  const displayIsUp = activePoint ? activePoint.val >= firstPointVal : chartSeries.isUp;

  const timeLabel = activePoint
    ? activePoint.timeFormatted
    : TIMEFRAME_LABELS[activeTimeframe][language === 'es' ? 'es' : 'en'];

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
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
    },
    [points],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
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
    },
    [isPressing, points],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    setIsPressing(false);
    setHoveredIndex(null);
    try {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
  }, []);

  const handlePointerCancel = useCallback(() => {
    setIsPressing(false);
    setHoveredIndex(null);
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    symbol,
    language,
    loading,
    currentPrice,
    poolItem,
    chartSeries,
    activityTrades,
    activeTimeframe,
    setActiveTimeframe,
    activePoint,
    hoveredIndex,
    displayPrice,
    displayDiff,
    displayPct,
    displayIsUp,
    timeLabel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleBack,
  };
}
