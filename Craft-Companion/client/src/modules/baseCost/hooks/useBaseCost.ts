import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { extractPriceMap } from '../../../services/priceService';
import { fetchRoninPoolsData, type RoninPoolsDataset } from '../../../services/roninPoolsService';
import {
  ALL_BASE_COST_TOKENS,
  BASE_COST_CATEGORIES,
  getMaxFactoryLevel,
  clampFactoryLevel,
} from '../data/baseCostCatalog';
import {
  calculateBaseCostRow,
  calculateSummaryStats,
} from '../services/baseCostCalculatorService';
import type {
  BaseCostRowData,
  BaseCostSettings,
  BaseCostSummaryStats,
  CategoryKey,
} from '../types';

const STORAGE_KEYS = {
  levels: 'cw:bc-levels',
  masteries: 'cw:bc-masteries',
  powerCost: 'cw:power-cost',
  buySlippage: 'cw:buy-slippage',
  buySlippagePct: 'cw:buy-slippage-pct',
  sellSlippage: 'cw:sell-slippage',
  sellSlippagePct: 'cw:sell-slippage-pct',
  marketFee: 'cw:market-fee',
  marketFeePct: 'cw:market-fee-pct',
  masteryMode: 'cw:bc-mastery-mode',
};

function getInitialLevels(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const token of ALL_BASE_COST_TOKENS) {
    map[token] = 1;
  }
  return map;
}

function getInitialMasteries(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const token of ALL_BASE_COST_TOKENS) {
    map[token] = 0;
  }
  return map;
}

export function useBaseCost() {
  const isMountedRef = useRef(false);
  const [justImported, setJustImported] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [strategyFilter, setStrategyFilter] = useState<'all' | 'craft' | 'buy'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [poolsDataset, setPoolsDataset] = useState<RoninPoolsDataset | null>(null);

  // Levels & Masteries
  const [levels, setLevels] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.levels);
        if (stored) return { ...getInitialLevels(), ...JSON.parse(stored) };
      } catch {}
    }
    return getInitialLevels();
  });

  const [masteries, setMasteries] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.masteries);
        if (stored) return { ...getInitialMasteries(), ...JSON.parse(stored) };
      } catch {}
    }
    return getInitialMasteries();
  });

  // Settings
  const [settings, setSettings] = useState<BaseCostSettings>(() => {
    let buySlippage = false;
    let buySlippagePct = 3;
    let sellSlippage = false;
    let sellSlippagePct = 3;
    let marketFee = true;
    let marketFeePct = 5;
    let powerPricePer100k = 0;
    let masteryMode: 'individual' | 'chain' = 'individual';

    if (typeof window !== 'undefined') {
      try {
        const rawBuy = localStorage.getItem(STORAGE_KEYS.buySlippage);
        if (rawBuy !== null) buySlippage = rawBuy === 'true';

        const rawBuyPct = localStorage.getItem(STORAGE_KEYS.buySlippagePct);
        if (rawBuyPct !== null) buySlippagePct = parseFloat(rawBuyPct) || 3;

        const rawSell = localStorage.getItem(STORAGE_KEYS.sellSlippage);
        if (rawSell !== null) sellSlippage = rawSell === 'true';

        const rawSellPct = localStorage.getItem(STORAGE_KEYS.sellSlippagePct);
        if (rawSellPct !== null) sellSlippagePct = parseFloat(rawSellPct) || 3;

        const rawFee = localStorage.getItem(STORAGE_KEYS.marketFee);
        if (rawFee !== null) marketFee = rawFee === 'true';

        const rawFeePct = localStorage.getItem(STORAGE_KEYS.marketFeePct);
        if (rawFeePct !== null) marketFeePct = parseFloat(rawFeePct) || 5;

        const rawPower = localStorage.getItem(STORAGE_KEYS.powerCost);
        if (rawPower !== null) powerPricePer100k = parseFloat(rawPower) || 0;

        const rawMode = localStorage.getItem(STORAGE_KEYS.masteryMode);
        if (rawMode === 'chain' || rawMode === 'individual') {
          masteryMode = rawMode;
        }
      } catch {}
    }

    return {
      buySlippage,
      buySlippagePct,
      sellSlippage,
      sellSlippagePct,
      marketFee,
      marketFeePct,
      powerPricePer100k,
      masteryMode,
    };
  });

  // Query Home Data for live prices
  const { data: home, isLoading: isPricesLoading, isError: isPricesError, dataUpdatedAt } =
    useCraftworldHomeQuery();

  // Load live Katana V3 pool dataset periodically
  useEffect(() => {
    let mounted = true;
    const loadPools = () => {
      fetchRoninPoolsData().then((data) => {
        if (mounted && data) {
          setPoolsDataset(data);
        }
      });
    };
    loadPools();
    const interval = setInterval(loadPools, 10000); // Auto-refresh DEX pools every 10s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.levels, JSON.stringify(levels));
      localStorage.setItem(STORAGE_KEYS.masteries, JSON.stringify(masteries));
      localStorage.setItem(STORAGE_KEYS.buySlippage, String(settings.buySlippage));
      localStorage.setItem(STORAGE_KEYS.buySlippagePct, String(settings.buySlippagePct));
      localStorage.setItem(STORAGE_KEYS.sellSlippage, String(settings.sellSlippage));
      localStorage.setItem(STORAGE_KEYS.sellSlippagePct, String(settings.sellSlippagePct));
      localStorage.setItem(STORAGE_KEYS.marketFee, String(settings.marketFee ?? true));
      localStorage.setItem(STORAGE_KEYS.marketFeePct, String(settings.marketFeePct ?? 5));
      localStorage.setItem(STORAGE_KEYS.powerCost, String(settings.powerPricePer100k));
      localStorage.setItem(STORAGE_KEYS.masteryMode, settings.masteryMode ?? 'individual');
    } catch (err) {
      console.warn('Failed saving base cost state to localStorage', err);
    }
  }, [levels, masteries, settings]);

  // Price dictionary: Unifies live Katana V3 DEX rates with Home game quotes
  const prices = useMemo(() => {
    return extractPriceMap(home, poolsDataset);
  }, [home, poolsDataset]);

  // Freshness calculation (seconds since last update)
  const [secondsAgo, setSecondsAgo] = useState(0);
  useEffect(() => {
    const updateTime = () => {
      if (dataUpdatedAt) {
        const sec = Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 1000));
        setSecondsAgo(sec);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 5000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const freshnessColor = useMemo(() => {
    if (secondsAgo >= 240 || isPricesError) return 'text-rose-400';
    if (secondsAgo >= 120) return 'text-amber-400';
    return 'text-emerald-400';
  }, [secondsAgo, isPricesError]);

  // Resource rows computation
  const allRows: BaseCostRowData[] = useMemo(() => {
    const rows: BaseCostRowData[] = [];
    for (const cat of BASE_COST_CATEGORIES) {
      for (const token of cat.resources) {
        rows.push(
          calculateBaseCostRow(
            token,
            levels,
            masteries,
            settings,
            prices,
            cat.id,
          ),
        );
      }
    }
    return rows;
  }, [levels, masteries, settings, prices]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    let result = allRows;

    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    if (strategyFilter === 'craft') {
      result = result.filter((r) => !r.isRootResource && r.isCraftCheaper);
    } else if (strategyFilter === 'buy') {
      result = result.filter((r) => !r.isRootResource && !r.isCraftCheaper);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.token.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allRows, selectedCategory, strategyFilter, search]);

  // Grouped rows by category
  const groupedRows = useMemo(() => {
    const map = new Map<CategoryKey, BaseCostRowData[]>();
    for (const cat of BASE_COST_CATEGORIES) {
      map.set(cat.id, []);
    }
    for (const row of filteredRows) {
      const list = map.get(row.category as CategoryKey);
      if (list) list.push(row);
    }
    return map;
  }, [filteredRows]);

  // High-level summary stats
  const summaryStats: BaseCostSummaryStats = useMemo(() => {
    return calculateSummaryStats(allRows, prices);
  }, [allRows, prices]);

  // Actions
  const setLevel = useCallback((token: string, level: number) => {
    const norm = token.toUpperCase();
    const clamped = clampFactoryLevel(norm, level);
    setLevels((prev) => ({ ...prev, [norm]: clamped }));
  }, []);

  const setMastery = useCallback((token: string, mastery: number) => {
    const norm = token.toUpperCase();
    const clamped = Math.min(10, Math.max(0, mastery));
    setMasteries((prev) => ({ ...prev, [norm]: clamped }));
  }, []);

  const setMaxAllLevels = useCallback(() => {
    setLevels((prev) => {
      const next = { ...prev };
      for (const token of ALL_BASE_COST_TOKENS) {
        next[token] = getMaxFactoryLevel(token);
      }
      return next;
    });
  }, []);

  const setMaxAllMasteries = useCallback(() => {
    setMasteries((prev) => {
      const next = { ...prev };
      for (const token of ALL_BASE_COST_TOKENS) {
        next[token] = 10;
      }
      return next;
    });
  }, []);

  const resetLevels = useCallback(() => {
    setLevels(getInitialLevels());
  }, []);

  const resetMasteries = useCallback(() => {
    setMasteries(getInitialMasteries());
  }, []);

  const resetAll = useCallback(() => {
    setLevels(getInitialLevels());
    setMasteries(getInitialMasteries());
  }, []);

  const importFromPriceTable = useCallback(() => {
    try {
      let importedLevels: Record<string, number> = {};
      let importedMasteries: Record<string, number> = {};

      const rawLvl = localStorage.getItem('cw:factory-levels');
      if (rawLvl) {
        const parsed = JSON.parse(rawLvl);
        if (typeof parsed === 'object' && parsed !== null) {
          importedLevels = parsed;
        }
      }

      const rawMast = localStorage.getItem('cw:masteries');
      if (rawMast) {
        const parsed = JSON.parse(rawMast);
        if (typeof parsed === 'object' && parsed !== null) {
          importedMasteries = parsed;
        }
      }

      // If home has user proficiencies, merge those too
      if (home?.proficiencies && Array.isArray(home.proficiencies)) {
        for (const p of home.proficiencies) {
          if (p.symbol && typeof p.level === 'number') {
            importedMasteries[p.symbol.toUpperCase()] = p.level;
          }
        }
      }

      if (Object.keys(importedLevels).length > 0) {
        setLevels((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(importedLevels)) {
            next[k.toUpperCase()] = clampFactoryLevel(k, Number(v) || 1);
          }
          return next;
        });
      }

      if (Object.keys(importedMasteries).length > 0) {
        setMasteries((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(importedMasteries)) {
            next[k.toUpperCase()] = Math.min(10, Math.max(0, Number(v) || 0));
          }
          return next;
        });
      }

      setJustImported(true);
      setTimeout(() => setJustImported(false), 2200);
    } catch (err) {
      console.warn('Failed importing from price table', err);
    }
  }, [home]);

  const updateSettings = useCallback((partial: Partial<BaseCostSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    levels,
    masteries,
    settings,
    prices,
    allRows,
    filteredRows,
    groupedRows,
    summaryStats,
    isPricesLoading,
    isPricesError,
    secondsAgo,
    freshnessColor,
    justImported,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    strategyFilter,
    setStrategyFilter,
    viewMode,
    setViewMode,
    setLevel,
    setMastery,
    setMaxAllLevels,
    setMaxAllMasteries,
    resetLevels,
    resetMasteries,
    resetAll,
    importFromPriceTable,
    updateSettings,
  };
}
