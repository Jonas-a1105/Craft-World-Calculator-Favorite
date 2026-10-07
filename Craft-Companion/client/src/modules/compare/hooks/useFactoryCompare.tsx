import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { loadFactoryData } from '../../../services/factoryData';
import { calculateFactoryCycle, type FactoryCycleResult } from '../../../services/craftworldCalculations';
import { getCraftworldHome } from '../../../services/api';
import { extractPriceMap } from '../../../services/priceService';
import { FactoryIcon } from '../../../components/GameIcon';
import type { UseFactoryCompareReturn } from '../types';
import { calculateComparisonVerdict } from '../services/compareService';

export function useFactoryCompare(): UseFactoryCompareReturn {
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [token1, setToken1] = useState('STEEL');
  const [level1, setLevel1] = useState(1);
  const [token2, setToken2] = useState('STEEL');
  const [level2, setLevel2] = useState(2);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [userFactories, setUserFactories] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        if (factoryRows.length > 0) {
          const first = factoryRows[0].token;
          setToken1(first);
          setToken2(first);
          setLevel1(1);
          setLevel2(2);
        }
        setPrices(extractPriceMap(home));

        const ownedMap: Record<string, number> = {};
        if (home?.craftWorld?.factories && Array.isArray(home.craftWorld.factories)) {
          home.craftWorld.factories.forEach((f: any) => {
            if (f.symbol) ownedMap[f.symbol.toUpperCase()] = f.level || 1;
          });
        }
        setUserFactories(ownedMap);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const cycle1: FactoryCycleResult | null = useMemo(() => {
    return row1 ? calculateFactoryCycle(row1, prices) : null;
  }, [row1, prices]);

  const cycle2: FactoryCycleResult | null = useMemo(() => {
    return row2 ? calculateFactoryCycle(row2, prices) : null;
  }, [row2, prices]);

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
    handleSwap,
    handleCompareNextLevel,
    handleCompareMaxLevel,
  };
}
