import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import {
  calculateFactoryCycle,
  type FactoryCycleResult,
  type RuntimeContext,
} from '../../../services/craftworldCalculations';
import { extractPriceMap } from '../../../services/priceService';
import { FactoryIcon } from '../../../components/GameIcon';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import { useAppStore } from '../../../store/useAppStore';
import type { UseFactoryCompareReturn } from '../types';
import { calculateComparisonVerdict } from '../services/compareService';
import { extractPlotFactoriesMap } from '../../profitability/services/cycleAdjuster';

export function useFactoryCompare(): UseFactoryCompareReturn {
  const { data: home, isLoading: isHomeLoading } = useCraftworldHomeQuery();
  const { data: rows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const loading = isHomeLoading || isRowsLoading;

  const favorites = useAppStore((state) => state.favorites);
  const [token1, setToken1] = useState('STEEL');
  const [level1, setLevel1] = useState(1);
  const [token2, setToken2] = useState('STEEL');
  const [level2, setLevel2] = useState(2);
  const [withPlayerBonuses, setWithPlayerBonuses] = useState(true);

  const plotFactoriesMap = useMemo(() => extractPlotFactoriesMap(home), [home]);

  const userFactories = useMemo(() => {
    const ownedMap: Record<string, number> = {};
    plotFactoriesMap.forEach((detail, symbol) => {
      ownedMap[symbol] = detail.level;
    });
    return ownedMap;
  }, [plotFactoriesMap]);

  useEffect(() => {
    if (rows.length > 0 && token1 === 'STEEL') {
      const preferred = favorites.find((f) => rows.some((r) => r.token === f));
      if (preferred) {
        setToken1(preferred);
        setToken2(preferred);
        const owned = userFactories[preferred];
        setLevel1(owned || 1);
        setLevel2(owned ? Math.min(owned + 1, 40) : 2);
      } else if (!rows.some((r) => r.token === 'STEEL')) {
        const first = rows[0].token;
        setToken1(first);
        setToken2(first);
        const owned = userFactories[first];
        setLevel1(owned || 1);
        setLevel2(owned ? Math.min(owned + 1, 40) : 2);
      } else {
        const owned = userFactories['STEEL'];
        if (owned) {
          setLevel1(owned);
          setLevel2(Math.min(owned + 1, 40));
        }
      }
    }
  }, [rows, token1, favorites, userFactories]);

  const prices = useMemo(() => extractPriceMap(home), [home]);

  const uniqueTokens = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.token))).filter(Boolean);
  }, [rows]);

  const tokenOptions = useMemo(() => {
    return uniqueTokens.map((t) => ({
      value: t,
      label: t,
      icon: <FactoryIcon symbol={t} size={18} />,
    }));
  }, [uniqueTokens]);

  const availableLevels1 = useMemo(() => {
    return rows
      .filter((r) => r.token === token1)
      .map((r) => r.level)
      .sort((a, b) => a - b);
  }, [rows, token1]);

  const levelOptions1 = useMemo(() => {
    return availableLevels1.map((lvl) => ({
      value: lvl,
      label: `Nv. ${lvl}`,
    }));
  }, [availableLevels1]);

  const availableLevels2 = useMemo(() => {
    return rows
      .filter((r) => r.token === token2)
      .map((r) => r.level)
      .sort((a, b) => a - b);
  }, [rows, token2]);

  const levelOptions2 = useMemo(() => {
    return availableLevels2.map((lvl) => ({
      value: lvl,
      label: `Nv. ${lvl}`,
    }));
  }, [availableLevels2]);

  const row1 = useMemo(() => {
    return (
      rows.find((r) => r.token === token1 && r.level === level1) ||
      rows.find((r) => r.token === token1)
    );
  }, [rows, token1, level1]);

  const row2 = useMemo(() => {
    return (
      rows.find((r) => r.token === token2 && r.level === level2) ||
      rows.find((r) => r.token === token2)
    );
  }, [rows, token2, level2]);

  const context: RuntimeContext = useMemo(() => {
    if (!withPlayerBonuses) return {};
    const rawHome = home as any;
    return {
      workshop: rawHome?.craft?.workshop || rawHome?.craftWorld?.workshop || [],
      proficiencies: rawHome?.craft?.proficiencies || rawHome?.craftWorld?.proficiencies || [],
      activeBoostMultiplier: home?.purchases?.isNoAdsActive ? 2 : 1,
    };
  }, [withPlayerBonuses, home]);

  const cycle1: FactoryCycleResult | null = useMemo(() => {
    return row1 ? calculateFactoryCycle(row1, prices, context) : null;
  }, [row1, prices, context]);

  const cycle2: FactoryCycleResult | null = useMemo(() => {
    return row2 ? calculateFactoryCycle(row2, prices, context) : null;
  }, [row2, prices, context]);

  const handleSwap = useCallback(() => {
    const tempT = token1;
    const tempL = level1;
    setToken1(token2);
    setLevel1(level2);
    setToken2(tempT);
    setLevel2(tempL);
  }, [token1, level1, token2, level2]);

  const handleCompareNextLevel = useCallback(() => {
    setToken2(token1);
    const maxL = Math.max(...availableLevels1, 1);
    setLevel2(Math.min(level1 + 1, maxL));
  }, [token1, availableLevels1, level1]);

  const handleCompareMaxLevel = useCallback(() => {
    setToken2(token1);
    const maxL = Math.max(...availableLevels1, 1);
    setLevel2(maxL);
  }, [token1, availableLevels1]);

  const comparisonVerdict = useMemo(() => {
    return calculateComparisonVerdict(cycle1, cycle2, token1 === token2);
  }, [cycle1, cycle2, token1, token2]);

  return {
    loading,
    token1,
    setToken1,
    level1,
    setLevel1,
    token2,
    setToken2,
    level2,
    setLevel2,
    tokenOptions,
    availableLevels1,
    levelOptions1,
    availableLevels2,
    levelOptions2,
    userFactories,
    cycle1,
    cycle2,
    comparisonVerdict,
    withPlayerBonuses,
    setWithPlayerBonuses,
    handleSwap,
    handleCompareNextLevel,
    handleCompareMaxLevel,
  };
}
