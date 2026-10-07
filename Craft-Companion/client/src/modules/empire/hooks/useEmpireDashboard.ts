import { useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import {
  calculateEmpireOverviewStats,
  summarizeBuildings,
} from '../services/empireService';

export function useEmpireDashboard() {
  const { language } = useTranslation();
  const { data, isLoading: loading } = useCraftworldHomeQuery();

  const stats = useMemo(() => {
    return calculateEmpireOverviewStats(data);
  }, [data]);

  const buildingSummary = useMemo(() => {
    return summarizeBuildings(data?.craftWorld?.playerBase);
  }, [data]);

  const landPlots = data?.craftWorld?.landPlots || [];
  const workers = data?.craftWorld?.workers || [];
  const playerBase = data?.craftWorld?.playerBase || [];

  return {
    language,
    loading,
    stats,
    buildingSummary,
    landPlots,
    workers,
    playerBase,
  };
}
