import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { loadFactoryData, type FactoryDataRow } from '../../../services/factoryData';
import { getCraftworldHome } from '../../../services/api';
import {
  extractValueChainPrices,
  computeValueChainAnalysis,
} from '../services/valueChainService';
import type { ValueChainMode, ValueChainAnalysis } from '../types';

export function useValueChain() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string>('COPPER');
  const [selectedLevel, setSelectedLevel] = useState<number>(18);
  const [mode, setMode] = useState<ValueChainMode>('self_crafted');
  const [proficiencies, setProficiencies] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        if (!mounted) return;
        setRows(factoryRows);
        setPrices(extractValueChainPrices(home));
        if (home?.proficiencies) {
          setProficiencies(home.proficiencies);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLevelChange = useCallback((newLevel: number) => {
    setSelectedLevel(Math.min(40, Math.max(1, newLevel)));
  }, []);

  const analysis: ValueChainAnalysis | null = useMemo(() => {
    return computeValueChainAnalysis(
      selectedToken,
      selectedLevel,
      rows,
      prices,
      proficiencies,
      mode,
    );
  }, [selectedToken, selectedLevel, rows, prices, proficiencies, mode]);

  return {
    language,
    loading,
    selectedToken,
    setSelectedToken,
    selectedLevel,
    handleLevelChange,
    mode,
    setMode,
    analysis,
  };
}
