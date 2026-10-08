import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { extractPriceMap } from '../../../services/priceService';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import type {
  MatrixViewMode,
  FactoryBoostMode,
  MatrixCellProfit,
  UseMatrixReturn,
} from '../types';
import {
  CATEGORIES,
  calculateSpeedMultiplier,
  calculateProfitPerHour,
  sortResourcesByOrder,
} from '../services/matrixService';

export function useMatrix(): UseMatrixReturn {
  const { language } = useTranslation();
  const { data: home, isLoading: isHomeLoading } = useCraftworldHomeQuery();
  const { data: rows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const loading = isHomeLoading || isRowsLoading;

  const [viewMode, setViewMode] = useState<MatrixViewMode>('matrix');

  // Ajustes en vivo (Settings bar)
  const [adBoost2x, setAdBoost2x] = useState(false);
  const [factoryBoost, setFactoryBoost] = useState<FactoryBoostMode>('none');
  const [buySlippage, setBuySlippage] = useState(false);
  const [sellSlippage, setSellSlippage] = useState(false);
  const [powerPrice, setPowerPrice] = useState(0); // COIN / 100k Power

  // Filtros de categoría seleccionados
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Precios dinámicos editables por recurso
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [basePriceMap, setBasePriceMap] = useState<Record<string, number>>({});

  // Nivel de maestría por recurso (0-10)
  const [masteryMap, setMasteryMap] = useState<Record<string, number>>({});
  const [openMasteryRes, setOpenMasteryRes] = useState<string | null>(null);

  // Búsqueda para modo tabla
  const [tableSearch, setTableSearch] = useState('');

  // Sincronizar precios base y maestrías cuando la query retorne datos
  useEffect(() => {
    if (home) {
      const extracted = extractPriceMap(home);
      setBasePriceMap(extracted);
      setPriceMap((prev) => (Object.keys(prev).length === 0 ? extracted : prev));

      const newMasteryMap: Record<string, number> = {};
      const rawProficiencies = home?.craft?.proficiencies || home?.craftWorld?.proficiencies;
      if (rawProficiencies && Array.isArray(rawProficiencies)) {
        rawProficiencies.forEach((p: { symbol?: string; token?: string; level?: number; claimedLevel?: number }) => {
          const sym = (p.symbol || p.token || '').toUpperCase();
          if (sym) {
            newMasteryMap[sym] = Math.min(10, Math.max(0, p.level ?? p.claimedLevel ?? 0));
          }
        });
      }
      setMasteryMap(newMasteryMap);
    }
  }, [home]);

  const speedMultiplier = useMemo(() => {
    return calculateSpeedMultiplier(adBoost2x, factoryBoost);
  }, [adBoost2x, factoryBoost]);

  const boostOptions = useMemo(
    () => [
      { value: 'none', label: language === 'es' ? 'Sin Boost' : 'No Boost' },
      { value: '2x', label: '2x Boost' },
      { value: '3.6x', label: '3.6x Boost' },
      { value: '5x', label: '5x Boost' },
    ],
    [language]
  );

  const buySlippageFactor = buySlippage ? 1.05 : 1.0;
  const sellSlippageFactor = sellSlippage ? 0.95 : 1.0;

  // Lista de todos los recursos únicos de las fábricas ordenados
  const availableResources = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.output_token) set.add(r.output_token);
      if (r.token) set.add(r.token);
    });
    return sortResourcesByOrder(Array.from(set));
  }, [rows]);

  // Filtrado de recursos por categoría si hay alguna seleccionada
  const visibleResources = useMemo(() => {
    if (!selectedCategory) return availableResources;
    const cat = CATEGORIES[selectedCategory];
    if (!cat || !cat.resources.length) return availableResources;
    return availableResources.filter((res) => cat.resources.includes(res));
  }, [availableResources, selectedCategory]);

  // Niveles del 1 al 20
  const levels = useMemo(() => Array.from({ length: 20 }, (_, i) => i + 1), []);

  // Mapeo rápido: [token][level] => FactoryDataRow
  const rowLookup = useMemo(() => {
    const map = new Map<string, FactoryDataRow>();
    rows.forEach((r) => {
      map.set(`${r.token}_${r.level}`, r);
      if (r.output_token && !map.has(`${r.output_token}_${r.level}`)) {
        map.set(`${r.output_token}_${r.level}`, r);
      }
    });
    return map;
  }, [rows]);

  const workshop = useMemo(() => {
    const rawHome = home as any;
    return rawHome?.craft?.workshop || rawHome?.craftWorld?.workshop || [];
  }, [home]);

  const getCellProfit = useCallback(
    (resource: string, level: number): MatrixCellProfit => {
      const row = rowLookup.get(`${resource}_${level}`);
      const masteryLvl = masteryMap[resource] ?? 0;
      return calculateProfitPerHour(
        row,
        resource,
        masteryLvl,
        speedMultiplier,
        priceMap,
        buySlippageFactor,
        sellSlippageFactor,
        powerPrice,
        workshop,
      );
    },
    [rowLookup, masteryMap, speedMultiplier, priceMap, buySlippageFactor, sellSlippageFactor, powerPrice, workshop]
  );

  const handleResetPrices = useCallback(() => {
    setPriceMap(basePriceMap);
  }, [basePriceMap]);

  const setMasteryForResource = useCallback((resource: string, level: number) => {
    setMasteryMap((prev) => ({ ...prev, [resource]: level }));
  }, []);

  return {
    loading,
    viewMode,
    setViewMode,
    adBoost2x,
    setAdBoost2x,
    factoryBoost,
    setFactoryBoost,
    buySlippage,
    setBuySlippage,
    sellSlippage,
    setSellSlippage,
    powerPrice,
    setPowerPrice,
    selectedCategory,
    setSelectedCategory,
    priceMap,
    setPriceMap,
    handleResetPrices,
    masteryMap,
    setMasteryForResource,
    openMasteryRes,
    setOpenMasteryRes,
    tableSearch,
    setTableSearch,
    visibleResources,
    availableResources,
    levels,
    rows,
    boostOptions,
    getCellProfit,
  };
}
