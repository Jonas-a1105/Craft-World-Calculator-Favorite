import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { getCraftworldHome } from '../../../services/api';
import { extractPriceMap } from '../../../services/priceService';
import type { Timeframe } from '../types';
import {
  generateChartSeries,
  extractActivityTrades,
  TIMEFRAME_LABELS,
} from '../services/resourceDetailService';

export function useResourceDetail() {
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
    let isMounted = true;
    getCraftworldHome()
      .then((home) => {
        if (!isMounted) return;
        setHomeData(home);
        setPrices(extractPriceMap(home));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPrice = useMemo(() => {
    return prices[symbol] || 0.0045;
  }, [prices, symbol]);

  const chartSeries = useMemo(() => {
    return generateChartSeries(currentPrice, symbol, activeTimeframe, language);
  }, [currentPrice, symbol, activeTimeframe, language]);

  const activityTrades = useMemo(() => {
    return extractActivityTrades(homeData?.exchange?.tradeExecutions, symbol, currentPrice);
  }, [homeData, symbol, currentPrice]);

  const { points } = chartSeries;
  const activePoint =
    isPressing && hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;
  const firstPointVal = points[0]?.val ?? currentPrice;
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
