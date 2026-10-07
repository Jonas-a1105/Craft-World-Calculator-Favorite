import { useEffect, useState, useMemo } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { loadFactoryData } from '../../../services/factoryData';
import { getCraftworldHome } from '../../../services/api';
import { extractPriceMap } from '../../../services/priceService';
import { computeValueChain } from '../../../services/valueChainCalculator';
import type {
  FilterMode,
  SortByOption,
  InputSupplyMode,
  ModalViewTab,
  UseProfitabilityReturn,
  ProfitabilityContext,
} from '../types';
import {
  extractOwnedMap,
  buildFactorySummaries,
  filterAndSortSummaries,
  getAdjustedCycle,
} from '../services/cycleAdjuster';

export function useProfitability(): UseProfitabilityReturn {
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        setHomeData(home);
        setPrices(extractPriceMap(home));
      })
      .finally(() => setLoading(false));
  }, []);

  const ownedMap = useMemo(() => extractOwnedMap(homeData), [homeData]);

  const context: ProfitabilityContext = useMemo(
    () => ({
      workshop: useWorkshop ? homeData?.craft?.workshop || [] : [],
      proficiencies: useMastery ? homeData?.craft?.proficiencies || [] : [],
      activeBoosts: useBoosters ? [{ boostValue: 0.5 }] : [],
    }),
    [useWorkshop, useMastery, useBoosters, homeData],
  );

  const factorySummaries = useMemo(
    () =>
      buildFactorySummaries({
        rows,
        ownedMap,
        prices,
        context,
        inputSupplyMode,
        useMastery,
      }),
    [rows, ownedMap, prices, context, inputSupplyMode, useMastery],
  );

  const filteredSummaries = useMemo(
    () =>
      filterAndSortSummaries({
        summaries: factorySummaries,
        search,
        filterMode,
        sortBy,
      }),
    [factorySummaries, search, filterMode, sortBy],
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

    let results = modalSummary.allRows.map((r) =>
      getAdjustedCycle({
        row: r,
        prices,
        context,
        inputSupplyMode,
        allRows: rows,
        useMastery,
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
  }, [modalSummary, modalLevelFilter, prices, context, inputSupplyMode, rows, useMastery]);

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
