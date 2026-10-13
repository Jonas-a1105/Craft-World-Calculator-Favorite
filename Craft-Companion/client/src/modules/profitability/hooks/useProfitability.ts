import { useState, useMemo } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { extractPriceMap } from '../../../services/priceService';
import { computeValueChain } from '../../../services/valueChainCalculator';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import { useAppStore } from '../../../store/useAppStore';
import type {
  FilterMode,
  SortByOption,
  InputSupplyMode,
  ModalViewTab,
  UseProfitabilityReturn,
  ProfitabilityContext,
  SimulationMode,
} from '../types';
import {
  extractOwnedMap,
  extractPlotFactoriesMap,
  buildFactorySummaries,
  filterAndSortSummaries,
  getAdjustedCycle,
} from '../services/cycleAdjuster';
import {
  calculateBoosterMultiplier,
  collectUniqueActiveBoosters,
} from '../../timers/services/factoryTimersService';

export function useProfitability(): UseProfitabilityReturn {
  const { data: homeData, isLoading: isHomeLoading } = useCraftworldHomeQuery();
  const { data: rows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const loading = isHomeLoading || isRowsLoading;

  const [simulationMode, setSimulationMode] = useState<SimulationMode>('projected');
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortBy, setSortBy] = useState<SortByOption>('profit_hour');

  const [selectedTokenModal, setSelectedTokenModal] = useState<string | null>(null);
  const [modalViewTab, setModalViewTab] = useState<ModalViewTab>('levels');
  const [modalLevelFilter, setModalLevelFilter] = useState<FilterMode>('all');

  const [useWorkshop, setUseWorkshop] = useState(true);
  const [useMastery, setUseMastery] = useState(true);
  const [useBoosters, setUseBoosters] = useState(true);
  const [inputSupplyMode, setInputSupplyMode] = useState<InputSupplyMode>('market');

  const prices = useMemo(() => extractPriceMap(homeData), [homeData]);
  const ownedMap = useMemo(() => extractOwnedMap(homeData), [homeData]);
  const plotFactoriesMap = useMemo(() => extractPlotFactoriesMap(homeData), [homeData]);
  const isNoAdsActive = Boolean(homeData?.purchases?.isNoAdsActive);

  // Modo proyectado: usar los boosters REALES activos de la cuenta (deduplicados).
  // Antes inventaba activeBoosts 0.5 + manualBoost ×2 = ×4 fantasma.
  const context: ProfitabilityContext = useMemo(
    () => ({
      workshop: useWorkshop ? homeData?.craft?.workshop || [] : [],
      proficiencies: useMastery ? homeData?.craft?.proficiencies || [] : [],
      activeBoosts: useBoosters ? collectUniqueActiveBoosters(homeData) : [],
      manualBoostMultiplier: 1,
    }),
    [useWorkshop, useMastery, useBoosters, homeData],
  );

  const factorySummaries = useMemo(
    () =>
      buildFactorySummaries({
        rows,
        ownedMap,
        plotFactoriesMap,
        prices,
        context,
        inputSupplyMode,
        useMastery,
        simulationMode,
        isNoAdsActive,
      }),
    [
      rows,
      ownedMap,
      plotFactoriesMap,
      prices,
      context,
      inputSupplyMode,
      useMastery,
      simulationMode,
      isNoAdsActive,
    ],
  );

  const favorites = useAppStore((state) => state.favorites);

  const filteredSummaries = useMemo(
    () => {
      const base = filterAndSortSummaries({
        summaries: factorySummaries,
        search,
        filterMode,
        sortBy,
      });
      if (sortBy !== 'alphabetical') {
        return [...base].sort((a, b) => {
          const aFav = favorites.includes(a.token.toUpperCase());
          const bFav = favorites.includes(b.token.toUpperCase());
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return 0;
        });
      }
      return base;
    },
    [factorySummaries, search, filterMode, sortBy, favorites],
  );

  const uniqueTokensCount = useMemo(
    () => new Set(rows.map((r) => r.token)).size,
    [rows],
  );

  const modalSummary = useMemo(
    () => factorySummaries.find((s) => s.token === selectedTokenModal),
    [factorySummaries, selectedTokenModal],
  );

  const modalCycleResults = useMemo(() => {
    if (!modalSummary) return [];

    const effectiveUseMastery = simulationMode === 'base' ? false : useMastery;

    const modalContext: ProfitabilityContext = simulationMode === 'base'
      ? {
          workshop: [],
          proficiencies: [],
          activeBoosts: [],
          manualBoostMultiplier: 1,
        }
      : simulationMode === 'active_owned'
        ? (() => {
            const plotDetail = plotFactoriesMap.get(modalSummary.token);
            // Boost real vigente sobre la instancia (0,5 ⇒ duración a la mitad ⇒
            // multiplicador de velocidad ×2). No-Ads no cuenta (no acelera nada).
            const boostFactor = calculateBoosterMultiplier(plotDetail?.boosters || []);
            let plotBoost = 1;
            if (boostFactor > 0 && boostFactor < 1) plotBoost = 1 / boostFactor;
            let workersPct = 0;
            if (plotDetail?.workerBoostIntervals && plotDetail.workerBoostIntervals.length > 0) {
              const sumBonus = plotDetail.workerBoostIntervals.reduce(
                (sum, w) => sum + (w.boostValue || 0),
                0,
              );
              workersPct = sumBonus * 100;
            }
            return {
              workshop: homeData?.craft?.workshop || [],
              proficiencies: homeData?.craft?.proficiencies || [],
              activeBoosts: [],
              manualBoostMultiplier: plotBoost,
              workersPercent: workersPct,
            };
          })()
        : {
            workshop: homeData?.craft?.workshop || [],
            proficiencies: homeData?.craft?.proficiencies || [],
            activeBoosts: collectUniqueActiveBoosters(homeData),
            manualBoostMultiplier: 1,
          };

    let results = modalSummary.allRows.map((r) =>
      getAdjustedCycle({
        row: r,
        prices,
        context: modalContext,
        inputSupplyMode,
        allRows: rows,
        useMastery: effectiveUseMastery,
      }),
    );

    if (modalLevelFilter !== 'all') {
      results = results.filter((c) => {
        if (modalLevelFilter === 'owned') return c.row.level === modalSummary.ownedLevel;
        if (modalLevelFilter === 'profitable') return c.effectiveProfitPerDay > 0;
        if (modalLevelFilter === 'loss') return c.effectiveProfitPerDay < 0;
        return true;
      });
    }

    return results;
  }, [
    modalSummary,
    modalLevelFilter,
    prices,
    simulationMode,
    plotFactoriesMap,
    isNoAdsActive,
    homeData,
    inputSupplyMode,
    rows,
    useMastery,
  ]);

  const modalChainAnalysis = useMemo(() => {
    if (!modalSummary) return null;

    return computeValueChain(
      modalSummary.token,
      modalSummary.ownedLevel || 1,
      rows,
      prices,
      homeData?.proficiencies || [],
      inputSupplyMode === 'self_crafted' ? 'self_crafted' : 'market_buy',
    );
  }, [modalSummary, rows, prices, homeData, inputSupplyMode]);

  return {
    loading,
    search,
    setSearch,
    simulationMode,
    setSimulationMode,
    filterMode,
    setFilterMode,
    sortBy,
    setSortBy,
    useWorkshop,
    setUseWorkshop,
    useMastery,
    setUseMastery,
    useBoosters,
    setUseBoosters,
    inputSupplyMode,
    setInputSupplyMode,
    selectedTokenModal,
    setSelectedTokenModal,
    modalViewTab,
    setModalViewTab,
    modalLevelFilter,
    setModalLevelFilter,
    filteredSummaries,
    uniqueTokensCount,
    ownedCount: ownedMap.size,
    modalSummary,
    modalCycleResults,
    modalChainAnalysis,
  };
}
