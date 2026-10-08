import { useState, useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useFactoryDataQuery, useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { extractPriceMap } from '../../../services/priceService';
import {
  calculateUpgradeRecommendation,
  type UpgradeRecommendation,
  type RuntimeContext,
} from '../../../services/craftworldCalculations';
import { filterAndSortRecommendations } from '../services/upgradeAdvisorService';
import type { AdvisorFilterMode } from '../types';
import { extractPlotFactoriesMap } from '../../profitability/services/cycleAdjuster';

export function useUpgradeAdvisor() {
  const { language } = useTranslation();
  const { data: rows = [], isLoading: loadingRows } = useFactoryDataQuery();
  const { data: home, isLoading: loadingHome } = useCraftworldHomeQuery();
  const loading = loadingRows || loadingHome;

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<AdvisorFilterMode>('all');

  const plotFactoriesMap = useMemo(() => extractPlotFactoriesMap(home), [home]);
  const ownedTokensMap = useMemo(() => {
    const map = new Map<string, number>();
    plotFactoriesMap.forEach((detail, symbol) => {
      map.set(symbol, detail.level);
    });
    return map;
  }, [plotFactoriesMap]);

  const prices = useMemo(() => extractPriceMap(home), [home]);

  const context: RuntimeContext = useMemo(() => {
    const rawHome = home as any;
    return {
      workshop: rawHome?.craft?.workshop || rawHome?.craftWorld?.workshop || [],
      proficiencies: rawHome?.craft?.proficiencies || rawHome?.craftWorld?.proficiencies || [],
      activeBoostMultiplier: home?.purchases?.isNoAdsActive ? 2 : 1,
    };
  }, [home]);

  const allRecommendations: UpgradeRecommendation[] = useMemo(() => {
    return calculateUpgradeRecommendation(rows, prices, context);
  }, [rows, prices, context]);

  const filteredRecommendations = useMemo(() => {
    return filterAndSortRecommendations(
      allRecommendations,
      searchTerm,
      filterMode,
      ownedTokensMap,
    );
  }, [allRecommendations, searchTerm, filterMode, ownedTokensMap]);

  return {
    language,
    loading,
    searchTerm,
    setSearchTerm,
    filterMode,
    setFilterMode,
    ownedCount: ownedTokensMap.size,
    allRecommendations,
    filteredRecommendations,
  };
}
