import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { loadFactoryData } from '../../../services/factoryData';
import { getCraftworldHome } from '../../../services/api';
import { extractPriceMap } from '../../../services/priceService';
import { useTranslation } from '../../../utils/i18n';
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
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Carga de datos de fábricas y precios
  useEffect(() => {
    let mounted = true;
    Promise.all([
      loadFactoryData(),
      getCraftworldHome().catch(() => null),
    ])
      .then(([factoryRows, home]) => {
        if (!mounted) return;
        setRows(factoryRows);

        const extracted = extractPriceMap(home);
        setPriceMap(extracted);
        setBasePriceMap(extracted);

        // Extraer maestrías si existen en el perfil
        const newMasteryMap: Record<string, number> = {};
        if (home?.craftWorld?.proficiencies && Array.isArray(home.craftWorld.proficiencies)) {
          home.craftWorld.proficiencies.forEach((p: any) => {
            const sym = (p.symbol || p.token || '').toUpperCase();
            if (sym) {
              newMasteryMap[sym] = Math.min(10, Math.max(0, p.level || p.claimedLevel || 0));
            }
          });
        }
        setMasteryMap(newMasteryMap);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
      );
    },
    [rowLookup, masteryMap, speedMultiplier, priceMap, buySlippageFactor, sellSlippageFactor, powerPrice]
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
