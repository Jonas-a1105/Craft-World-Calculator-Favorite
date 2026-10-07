import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { getCraftworldHome } from '../../../services/api';
import {
  calculateEmpireOverviewStats,
  summarizeBuildings,
} from '../services/empireService';

export function useEmpireDashboard() {
  const { language } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCraftworldHome()
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
