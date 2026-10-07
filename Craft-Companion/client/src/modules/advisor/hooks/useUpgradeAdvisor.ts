import { useState, useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useFactoryDataQuery, useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import { extractPriceMap } from '../../../services/priceService';
import {
  calculateUpgradeRecommendation,
  type UpgradeRecommendation,
} from '../../../services/craftworldCalculations';
import { filterAndSortRecommendations } from '../services/upgradeAdvisorService';
import type { AdvisorFilterMode } from '../types';

export function useUpgradeAdvisor() {
  const { language } = useTranslation();
  const { data: rows = [], isLoading: loadingRows } = useFactoryDataQuery();
  const { data: home, isLoading: loadingHome } = useCraftworldHomeQuery();
  const loading = loadingRows || loadingHome;

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<AdvisorFilterMode>('all');

  const prices = useMemo(() => extractPriceMap(home), [home]);

  const allRecommendations: UpgradeRecommendation[] = useMemo(() => {
    return calculateUpgradeRecommendation(rows, prices);
  }, [rows, prices]);

  const filteredRecommendations = useMemo(() => {
    return filterAndSortRecommendations(allRecommendations, searchTerm, filterMode);
  }, [allRecommendations, searchTerm, filterMode]);

  return {
    language,
    loading,
    searchTerm,
    setSearchTerm,
    filterMode,
    setFilterMode,
    allRecommendations,
    filteredRecommendations,
  };
}
