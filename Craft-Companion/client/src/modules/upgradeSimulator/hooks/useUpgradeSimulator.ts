import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { loadFactoryData, type FactoryDataRow } from '../../../services/factoryData';
import {
  loadMinesData,
  calculateUpgradeRequirements,
  consolidateResources,
} from '../services/upgradeSimulatorService';
import { FACILITY_CATALOG } from '../data/upgradeSimulatorCatalog';
import type {
  CategoryTab,
  FactoryUpgradeRow,
  ShoppingListItem,
  ConsolidatedResource,
} from '../types';

interface FacilityConfig {
  fromLevel: number;
  toLevel: number;
  qty: number;
  inCart: boolean;
}

function getDefaultConfigs(): Record<string, FacilityConfig> {
  const configs: Record<string, FacilityConfig> = {};
  for (const fac of FACILITY_CATALOG) {
    configs[fac.token] = {
      fromLevel: 1,
      toLevel: fac.maxLevel,
      qty: 1,
      inCart: false,
    };
  }
  return configs;
}

export function useUpgradeSimulator() {
  const { language } = useTranslation();
  const { data: home, isLoading: isPricesLoading } = useCraftworldHomeQuery();

  const [factoryRows, setFactoryRows] = useState<FactoryDataRow[]>([]);
  const [mineRows, setMineRows] = useState<FactoryDataRow[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [facilityConfigs, setFacilityConfigs] = useState<Record<string, FacilityConfig>>(() =>
    getDefaultConfigs(),
  );

  useEffect(() => {
    let mounted = true;
    Promise.all([loadFactoryData(), loadMinesData()])
      .then(([fRows, mRows]) => {
        if (mounted) {
          setFactoryRows(fRows);
          setMineRows(mRows);
          setIsDataLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsDataLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Map live prices from API
  const marketPriceMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    const prices = home?.priceList?.prices || [];
    for (const p of prices) {
      if (p.referenceSymbol) {
        map[p.referenceSymbol.toUpperCase()] = p.amount ?? 0;
      }
    }
    return map;
  }, [home]);

  // Update From Level
  const updateFromLevel = useCallback((token: string, newFrom: number) => {
    setFacilityConfigs((prev) => {
      const current = prev[token] || { fromLevel: 1, toLevel: 10, qty: 1, inCart: false };
      const safeFrom = Math.max(1, newFrom);
      const safeTo = Math.max(safeFrom, current.toLevel);
      return {
        ...prev,
        [token]: {
          ...current,
          fromLevel: safeFrom,
          toLevel: safeTo,
        },
      };
    });
  }, []);

  // Update To Level
  const updateToLevel = useCallback((token: string, newTo: number) => {
    const meta = FACILITY_CATALOG.find((f) => f.token === token);
    const maxLvl = meta ? meta.maxLevel : 50;

    setFacilityConfigs((prev) => {
      const current = prev[token] || { fromLevel: 1, toLevel: maxLvl, qty: 1, inCart: false };
      const safeTo = Math.min(maxLvl, Math.max(current.fromLevel, newTo));
      return {
        ...prev,
        [token]: {
          ...current,
          toLevel: safeTo,
        },
      };
    });
  }, []);

  // Update Qty
  const updateQty = useCallback((token: string, newQty: number) => {
    setFacilityConfigs((prev) => {
      const current = prev[token] || { fromLevel: 1, toLevel: 10, qty: 1, inCart: false };
      return {
        ...prev,
        [token]: {
          ...current,
          qty: Math.max(1, Math.floor(newQty || 1)),
        },
      };
    });
  }, []);

  // Toggle InCart
  const toggleCart = useCallback((token: string) => {
    setFacilityConfigs((prev) => {
      const current = prev[token];
      if (!current) return prev;
      return {
        ...prev,
        [token]: {
          ...current,
          inCart: !current.inCart,
        },
      };
    });
  }, []);

  // Reset All
  const resetAll = useCallback(() => {
    setFacilityConfigs(getDefaultConfigs());
  }, []);

  // Calculate full upgrade rows
  const allRows = useMemo<FactoryUpgradeRow[]>(() => {
    return FACILITY_CATALOG.map((fac) => {
      const conf = facilityConfigs[fac.token] || {
        fromLevel: 1,
        toLevel: fac.maxLevel,
        qty: 1,
        inCart: false,
      };

      const requiredResources = calculateUpgradeRequirements(
        fac,
        conf.fromLevel,
        conf.toLevel,
        conf.qty,
        factoryRows,
        mineRows,
        marketPriceMap,
      );

      const totalCostCoin = requiredResources.reduce((sum, r) => sum + r.totalCoin, 0);

      return {
        token: fac.token,
        nameEn: fac.nameEn,
        nameEs: fac.nameEs,
        category: fac.category,
        minLevel: 1,
        maxLevel: fac.maxLevel,
        fromLevel: conf.fromLevel,
        toLevel: conf.toLevel,
        qty: conf.qty,
        inCart: conf.inCart,
        requiredResources,
        totalCostCoin,
      };
    });
  }, [facilityConfigs, factoryRows, mineRows, marketPriceMap]);

  // Filter by category
  const filteredRows = useMemo<FactoryUpgradeRow[]>(() => {
    if (activeCategory === 'all') return allRows;
    return allRows.filter((r) => r.category === activeCategory);
  }, [allRows, activeCategory]);

  // Shopping List items
  const shoppingListItems = useMemo<ShoppingListItem[]>(() => {
    return allRows
      .filter((r) => r.inCart && r.requiredResources.length > 0)
      .map((r) => ({
        token: r.token,
        name: language === 'es' ? r.nameEs : r.nameEn,
        fromLevel: r.fromLevel,
        toLevel: r.toLevel,
        qty: r.qty,
        requiredResources: r.requiredResources,
        totalCostCoin: r.totalCostCoin,
      }));
  }, [allRows, language]);

  // Consolidated resources for shopping list
  const consolidatedResources = useMemo<ConsolidatedResource[]>(() => {
    return consolidateResources(shoppingListItems);
  }, [shoppingListItems]);

  // Grand total COIN for shopping list
  const shoppingListTotalCoin = useMemo<number>(() => {
    return shoppingListItems.reduce((acc, it) => acc + it.totalCostCoin, 0);
  }, [shoppingListItems]);

  return {
    language,
    loading: isDataLoading || isPricesLoading,
    activeCategory,
    setActiveCategory,
    rows: filteredRows,
    totalFacilitiesCount: FACILITY_CATALOG.length,
    shoppingListItems,
    consolidatedResources,
    shoppingListTotalCoin,
    updateFromLevel,
    updateToLevel,
    updateQty,
    toggleCart,
    resetAll,
    baseSymbol: home?.priceList?.baseSymbol || 'COIN',
  };
}
