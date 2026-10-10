import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import { useCoinLivePrice } from '../../../services/coinPriceService';
import { fetchRoninPoolsData, type RoninPoolsDataset } from '../../../services/roninPoolsService';
import { extractPriceMap } from '../../../services/priceService';
import { useAppStore } from '../../../store/useAppStore';
import {
  aggregateAccountFactories,
  getInitialFactoryRowConfig,
  type AccountAggregatedFactory,
} from '../services/accountAggregator';
import {
  computeFactoryTableRow,
  calculateSummaryTotals,
  filterAndSortTableRows,
} from '../services/pricesAndProfitabilityService';
import type {
  FactoryRowConfig,
  FactoryTableRow,
  GlobalProfitabilitySettings,
  ProfitabilitySummaryTotals,
  TableCategory,
  TableSortField,
  SortDirection,
  BoostOption,
  InputSupplyMode,
  ModalViewTab,
  FilterMode,
} from '../types';

export function useProfitabilityTable() {
  const { data: homeData, isLoading: isHomeLoading, refetch: refetchHome } = useCraftworldHomeQuery();
  const { data: allFactoryRows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const { data: coinData } = useCoinLivePrice();

  const [poolsDataset, setPoolsDataset] = useState<RoninPoolsDataset | null>(null);

  // Load katana pools for price changes (1h, 24h)
  useEffect(() => {
    let isMounted = true;
    fetchRoninPoolsData().then((data) => {
      if (isMounted && data) {
        setPoolsDataset(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const loading = isHomeLoading || isRowsLoading;

  // Global app store favorites
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = useAppStore((state) => state.isFavorite);

  // Account aggregate map
  const accountMap = useMemo(() => {
    return aggregateAccountFactories(homeData, allFactoryRows);
  }, [homeData, allFactoryRows]);

  // Global settings
  const [globalSettings, setGlobalSettings] = useState<GlobalProfitabilitySettings>({
    adBoost2x: false,
    buySlippage: false,
    sellSlippage: false,
    powerPriceCoin: 0,
    inputSupplyMode: 'market',
  });

  // Sync default adBoost2x with account purchase state
  useEffect(() => {
    if (homeData?.purchases?.isNoAdsActive) {
      setGlobalSettings((prev) => ({ ...prev, adBoost2x: true }));
    }
  }, [homeData?.purchases?.isNoAdsActive]);

  // Unique tokens catalog list
  const uniqueTokens = useMemo(() => {
    return Array.from(new Set(allFactoryRows.map((r) => r.token.toUpperCase()))).sort();
  }, [allFactoryRows]);

  // User simulated configs per token (overrides)
  const [userConfigs, setUserConfigs] = useState<Record<string, FactoryRowConfig>>({});

  // Initialize or re-populate configs when account data loads
  useEffect(() => {
    if (uniqueTokens.length === 0) return;

    setUserConfigs((prev) => {
      const next: Record<string, FactoryRowConfig> = { ...prev };
      uniqueTokens.forEach((token) => {
        // If not already customized, initialize from account data
        if (!next[token]) {
          next[token] = getInitialFactoryRowConfig(token, accountMap, homeData);
        }
      });
      return next;
    });
  }, [uniqueTokens, accountMap, homeData]);

  // Reset all configs to account defaults
  const resetToAccountData = useCallback(() => {
    const next: Record<string, FactoryRowConfig> = {};
    uniqueTokens.forEach((token) => {
      next[token] = getInitialFactoryRowConfig(token, accountMap, homeData);
    });
    setUserConfigs(next);
  }, [uniqueTokens, accountMap, homeData]);

  // Reset single token to account default
  const resetTokenToAccount = useCallback(
    (token: string) => {
      const norm = token.toUpperCase().trim();
      const initial = getInitialFactoryRowConfig(norm, accountMap, homeData);
      setUserConfigs((prev) => ({ ...prev, [norm]: initial }));
    },
    [accountMap, homeData],
  );

  // Config modifier actions
  const setCount = useCallback((token: string, count: number) => {
    const norm = token.toUpperCase().trim();
    setUserConfigs((prev) => {
      const current = prev[norm] || {
        count: 0,
        level: 1,
        masteryLevel: 0,
        workerPercent: 0,
        workshopPercent: 0,
        boost: 'None',
      };
      return {
        ...prev,
        [norm]: { ...current, count: Math.max(0, Math.floor(count)) },
      };
    });
  }, []);

  const incrementCount = useCallback(
    (token: string) => {
      const norm = token.toUpperCase().trim();
      setUserConfigs((prev) => {
        const current = prev[norm] || {
          count: 0,
          level: 1,
          masteryLevel: 0,
          workerPercent: 0,
          workshopPercent: 0,
          boost: 'None',
        };
        return {
          ...prev,
          [norm]: { ...current, count: current.count + 1 },
        };
      });
    },
    [],
  );

  const decrementCount = useCallback(
    (token: string) => {
      const norm = token.toUpperCase().trim();
      setUserConfigs((prev) => {
        const current = prev[norm] || {
          count: 0,
          level: 1,
          masteryLevel: 0,
          workerPercent: 0,
          workshopPercent: 0,
          boost: 'None',
        };
        return {
          ...prev,
          [norm]: { ...current, count: Math.max(0, current.count - 1) },
        };
      });
    },
    [],
  );

  const setLevel = useCallback((token: string, level: number) => {
    const norm = token.toUpperCase().trim();
    setUserConfigs((prev) => {
      const current = prev[norm] || {
        count: 0,
        level: 1,
        masteryLevel: 0,
        workerPercent: 0,
        workshopPercent: 0,
        boost: 'None',
      };
      return {
        ...prev,
        [norm]: { ...current, level: Math.max(1, Math.floor(level)) },
      };
    });
  }, []);

  const setMaxLevel = useCallback(
    (token: string) => {
      const norm = token.toUpperCase().trim();
      const tokenRows = allFactoryRows.filter((r) => r.token.toUpperCase() === norm);
      const max = tokenRows.length > 0 ? Math.max(...tokenRows.map((r) => r.level)) : 50;
      setLevel(norm, max);
    },
    [allFactoryRows, setLevel],
  );

  const setAllLevelsMax = useCallback(() => {
    setUserConfigs((prev) => {
      const next = { ...prev };
      uniqueTokens.forEach((token) => {
        const tokenRows = allFactoryRows.filter((r) => r.token.toUpperCase() === token);
        const max = tokenRows.length > 0 ? Math.max(...tokenRows.map((r) => r.level)) : 50;
        const current = next[token] || {
          count: 0,
          level: 1,
          masteryLevel: 0,
          workerPercent: 0,
          workshopPercent: 0,
          boost: 'None',
        };
        next[token] = { ...current, level: max };
      });
      return next;
    });
  }, [uniqueTokens, allFactoryRows]);

  const setMastery = useCallback((token: string, masteryLevel: number) => {
    const norm = token.toUpperCase().trim();
    setUserConfigs((prev) => {
      const current = prev[norm] || {
        count: 0,
        level: 1,
        masteryLevel: 0,
        workerPercent: 0,
        workshopPercent: 0,
        boost: 'None',
      };
      return {
        ...prev,
        [norm]: {
          ...current,
          masteryLevel: Math.max(0, Math.min(10, Math.floor(masteryLevel))),
        },
      };
    });
  }, []);

  const incrementMastery = useCallback((token: string) => {
    const norm = token.toUpperCase().trim();
    setUserConfigs((prev) => {
      const current = prev[norm] || {
        count: 0,
        level: 1,
        masteryLevel: 0,
        workerPercent: 0,
        workshopPercent: 0,
        boost: 'None',
      };
      return {
        ...prev,
        [norm]: {
          ...current,
          masteryLevel: Math.min(10, current.masteryLevel + 1),
        },
      };
    });
  }, []);

  const decrementMastery = useCallback((token: string) => {
    const norm = token.toUpperCase().trim();
    setUserConfigs((prev) => {
      const current = prev[norm] || {
        count: 0,
        level: 1,
        masteryLevel: 0,
        workerPercent: 0,
        workshopPercent: 0,
        boost: 'None',
      };
      return {
        ...prev,
        [norm]: {
          ...current,
          masteryLevel: Math.max(0, current.masteryLevel - 1),
        },
      };
    });
  }, []);

  const setBoost = useCallback((token: string, boost: BoostOption) => {
    const norm = token.toUpperCase().trim();
    setUserConfigs((prev) => {
      const current = prev[norm] || {
        count: 0,
        level: 1,
        masteryLevel: 0,
        workerPercent: 0,
        workshopPercent: 0,
        boost: 'None',
      };
      return {
        ...prev,
        [norm]: { ...current, boost },
      };
    });
  }, []);

  const setWorkerPercent = useCallback((token: string, pct: number) => {
    const norm = token.toUpperCase().trim();
    setUserConfigs((prev) => {
      const current = prev[norm] || {
        count: 0,
        level: 1,
        masteryLevel: 0,
        workerPercent: 0,
        workshopPercent: 0,
        boost: 'None',
      };
      return {
        ...prev,
        [norm]: { ...current, workerPercent: Math.max(0, Math.min(100, pct)) },
      };
    });
  }, []);

  const setWorkshopPercent = useCallback((token: string, pct: number) => {
    const norm = token.toUpperCase().trim();
    setUserConfigs((prev) => {
      const current = prev[norm] || {
        count: 0,
        level: 1,
        masteryLevel: 0,
        workerPercent: 0,
        workshopPercent: 0,
        boost: 'None',
      };
      return {
        ...prev,
        [norm]: { ...current, workshopPercent: Math.max(0, pct) },
      };
    });
  }, []);

  // Filter & Search & Sort state
  const [category, setCategory] = useState<TableCategory>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<TableSortField>('profit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSortChange = useCallback((field: TableSortField) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDirection('desc');
      return field;
    });
  }, []);

  // Prices map from API or fallback
  const prices = useMemo(() => extractPriceMap(homeData), [homeData]);
  const coinUsdPrice = coinData?.priceUsd || 0.0002105;

  // Build full table rows
  const allTableRows = useMemo<FactoryTableRow[]>(() => {
    return uniqueTokens.map((token) => {
      const tokenRows = allFactoryRows.filter((r) => r.token.toUpperCase() === token);
      const accountBaseline = getInitialFactoryRowConfig(token, accountMap, homeData);
      const config = userConfigs[token] || accountBaseline;

      return computeFactoryTableRow({
        token,
        config,
        accountBaseline,
        prices,
        tokenRows,
        allRows: allFactoryRows,
        settings: globalSettings,
        poolsDataset,
        coinUsdPrice,
      });
    });
  }, [
    uniqueTokens,
    allFactoryRows,
    accountMap,
    homeData,
    userConfigs,
    prices,
    globalSettings,
    poolsDataset,
    coinUsdPrice,
  ]);

  // Compute summary totals (sum of all active rows with count > 0)
  const totals = useMemo<ProfitabilitySummaryTotals>(() => {
    return calculateSummaryTotals(
      allTableRows,
      coinUsdPrice,
      coinData?.h1Change || 0,
      coinData?.h24Change || 0,
    );
  }, [allTableRows, coinUsdPrice, coinData?.h1Change, coinData?.h24Change]);

  // Filtered and sorted rows
  const filteredRows = useMemo(() => {
    return filterAndSortTableRows({
      rows: allTableRows,
      search,
      category,
      favorites,
      sortBy,
      sortDirection,
    });
  }, [allTableRows, search, category, favorites, sortBy, sortDirection]);

  // Modal drill-down state (detailed level 1-50 view)
  const [selectedTokenModal, setSelectedTokenModal] = useState<string | null>(null);
  const [modalViewTab, setModalViewTab] = useState<ModalViewTab>('levels');
  const [modalLevelFilter, setModalLevelFilter] = useState<FilterMode>('all');

  const selectedRowForModal = useMemo(() => {
    if (!selectedTokenModal) return undefined;
    return allTableRows.find((r) => r.token.toUpperCase() === selectedTokenModal.toUpperCase());
  }, [selectedTokenModal, allTableRows]);

  const hasAnyAccountFactories = useMemo(() => {
    return accountMap.size > 0;
  }, [accountMap]);

  return {
    loading,
    homeData,
    refetchHome,

    // Core table rows & totals
    allTableRows,
    filteredRows,
    totals,
    hasAnyAccountFactories,

    // Controls
    category,
    setCategory,
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSortChange,

    // Global settings
    globalSettings,
    setGlobalSettings,
    setAdBoost2x: (val: boolean) => setGlobalSettings((p) => ({ ...p, adBoost2x: val })),
    setBuySlippage: (val: boolean) => setGlobalSettings((p) => ({ ...p, buySlippage: val })),
    setSellSlippage: (val: boolean) => setGlobalSettings((p) => ({ ...p, sellSlippage: val })),
    setPowerPriceCoin: (val: number) => setGlobalSettings((p) => ({ ...p, powerPriceCoin: val })),
    setInputSupplyMode: (mode: InputSupplyMode) =>
      setGlobalSettings((p) => ({ ...p, inputSupplyMode: mode })),

    // Per-factory actions
    setCount,
    incrementCount,
    decrementCount,
    setLevel,
    setMaxLevel,
    setAllLevelsMax,
    setMastery,
    incrementMastery,
    decrementMastery,
    setBoost,
    setWorkerPercent,
    setWorkshopPercent,
    resetToAccountData,
    resetTokenToAccount,

    // Favorites
    favorites,
    toggleFavorite,
    isFavorite,

    // Modal drill-down
    selectedTokenModal,
    setSelectedTokenModal,
    modalViewTab,
    setModalViewTab,
    modalLevelFilter,
    setModalLevelFilter,
    selectedRowForModal,
  };
}
