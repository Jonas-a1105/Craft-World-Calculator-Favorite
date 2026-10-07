import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import {
  extractValueChainPrices,
  computeValueChainAnalysis,
} from '../services/valueChainService';
import type { ValueChainMode, ValueChainAnalysis } from '../types';

export function useValueChain() {
  const { language } = useTranslation();
  const { data: home, isLoading: isHomeLoading } = useCraftworldHomeQuery();
  const { data: rows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const loading = isHomeLoading || isRowsLoading;

  const [selectedToken, setSelectedToken] = useState<string>('COPPER');
  const [selectedLevel, setSelectedLevel] = useState<number>(18);
  const [mode, setMode] = useState<ValueChainMode>('self_crafted');

  const prices = useMemo(() => extractValueChainPrices(home), [home]);
  const proficiencies = useMemo(() => home?.proficiencies || [], [home]);

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
