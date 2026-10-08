import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { extractPriceMap } from '../../../services/priceService';
import { loadPriceHistory, savePriceSnapshots } from '../../../services/priceHistory';
import { useAppStore } from '../../../store/useAppStore';
import {
  extractRecommendations,
  createPriceSnapshots,
  calculateValuedInventory,
  filterValuedItems,
} from '../services/inventoryService';
import type { ValuedInventoryItem } from '../types';

export function useInventoryValue() {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { data: homeData, isLoading: loading } = useCraftworldHomeQuery();
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const prices = useMemo(() => extractPriceMap(homeData), [homeData]);

  useEffect(() => {
    if (homeData) {
      const snapshots = createPriceSnapshots(homeData);
      if (snapshots.length > 0) {
        savePriceSnapshots(snapshots);
      }
    }
  }, [homeData]);

  const toggleExpand = useCallback((symbol: string) => {
    setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
  }, []);

  const selectCategory = useCallback((categoryId: string | null) => {
    setActiveCategory(categoryId);
  }, []);

  const handleNavigateToResource = useCallback(
    (symbol: string) => {
      navigate(`/resource/${encodeURIComponent(symbol)}`);
    },
    [navigate],
  );

  const rawInventory = useMemo(() => {
    if (homeData?.craftWorld?.resources && Array.isArray(homeData.craftWorld.resources)) {
      return homeData.craftWorld.resources;
    }
    if (Array.isArray(homeData?.inventory)) {
      return homeData.inventory;
    }
    if (Array.isArray(homeData?.inventory?.balances)) {
      return homeData.inventory.balances;
    }
    return [];
  }, [homeData]);

  const recommendations = useMemo(() => {
    return extractRecommendations(homeData);
  }, [homeData]);

  const { valuedItems, totalValue } = useMemo(() => {
    const history = loadPriceHistory();
    return calculateValuedInventory(rawInventory, prices, recommendations, history);
  }, [rawInventory, prices, recommendations]);

  const resourceCount = useMemo(() => {
    return valuedItems.filter((i) => i.amount > 0).length;
  }, [valuedItems]);

  const favorites = useAppStore((state) => state.favorites);

  const filteredItems: ValuedInventoryItem[] = useMemo(() => {
    const list = filterValuedItems(valuedItems, activeCategory);
    return list.sort((a, b) => {
      const aFav = favorites.includes(a.symbol.toUpperCase());
      const bFav = favorites.includes(b.symbol.toUpperCase());
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [valuedItems, activeCategory, favorites]);

  return {
    language,
    loading,
    totalValue,
    resourceCount,
    valuedItems,
    filteredItems,
    prices,
    recommendations,
    expandedSymbol,
    activeCategory,
    toggleExpand,
    selectCategory,
    handleNavigateToResource,
  };
}
