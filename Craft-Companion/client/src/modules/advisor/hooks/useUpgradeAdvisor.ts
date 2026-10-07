import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { loadFactoryData, type FactoryDataRow } from '../../../services/factoryData';
import { getCraftworldHome } from '../../../services/api';
import { extractPriceMap } from '../../../services/priceService';
import {
  calculateUpgradeRecommendation,
  type UpgradeRecommendation,
} from '../../../services/craftworldCalculations';
import { filterAndSortRecommendations } from '../services/upgradeAdvisorService';
import type { AdvisorFilterMode } from '../types';

export function useUpgradeAdvisor() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<AdvisorFilterMode>('all');

  useEffect(() => {
    let mounted = true;
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        if (!mounted) return;
        setRows(factoryRows);
        setPrices(extractPriceMap(home));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
