import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../utils/i18n';
import { getCraftworldHome } from '../../../services/api';
import { extractPriceMap } from '../../../services/priceService';
import {
  loadPriceHistory,
  savePriceSnapshots,
} from '../../../services/priceHistory';
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
  const [homeData, setHomeData] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCraftworldHome()
      .then((home) => {
        if (!mounted) return;
        setHomeData(home);
        setPrices(extractPriceMap(home));
        const snapshots = createPriceSnapshots(home);
        if (snapshots.length > 0) {
          savePriceSnapshots(snapshots);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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

  const { valuedItems, totalValue } = useMemo(() => {
    const resources = homeData?.craftWorld?.resources || [];
    const recMap = extractRecommendations(homeData);
    const history = loadPriceHistory();
    return calculateValuedInventory(resources, prices, recMap, history);
  }, [homeData, prices]);

  const filteredItems = useMemo<ValuedInventoryItem[]>(() => {
    return filterValuedItems(valuedItems, activeCategory);
  }, [valuedItems, activeCategory]);

  const resourceCount = homeData?.craftWorld?.resources?.length || 0;

  return {
    language,
    loading,
    totalValue,
    resourceCount,
    activeCategory,
    expandedSymbol,
    filteredItems,
    toggleExpand,
    selectCategory,
    handleNavigateToResource,
  };
}
