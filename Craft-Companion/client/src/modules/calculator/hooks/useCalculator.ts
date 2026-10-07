import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import type { FactoryDataRow } from '../../../services/factoryData';
import { calculateFactoryCycle, type FactoryCycleResult } from '../../../services/craftworldCalculations';
import { extractPriceMap } from '../../../services/priceService';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import { useAppStore } from '../../../store/useAppStore';
import {
  extractUniqueTokens,
  getAvailableLevels,
  resolveCurrentRow,
} from '../services/calculatorService';

export function useCalculator() {
  const { language } = useTranslation();
  const { data: home, isLoading: isHomeLoading } = useCraftworldHomeQuery();
  const { data: rows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const loading = isHomeLoading || isRowsLoading;

  const favorites = useAppStore((state) => state.favorites);
  const [selectedToken, setSelectedToken] = useState<string>('STEEL');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  useEffect(() => {
    if (rows.length > 0 && selectedToken === 'STEEL') {
      const preferred = favorites.find((f) => rows.some((r) => r.token === f));
      if (preferred) {
        setSelectedToken(preferred);
      } else if (!rows.some((r) => r.token === 'STEEL')) {
        setSelectedToken(rows[0].token);
      }
    }
  }, [rows, selectedToken, favorites]);

  const prices = useMemo(() => extractPriceMap(home), [home]);

  const uniqueTokens = useMemo(() => extractUniqueTokens(rows), [rows]);

  const availableLevels = useMemo(
    () => getAvailableLevels(rows, selectedToken),
    [rows, selectedToken],
  );

  const currentRow = useMemo(
    () => resolveCurrentRow(rows, selectedToken, selectedLevel),
    [rows, selectedToken, selectedLevel],
  );

  const cycle: FactoryCycleResult | null = useMemo(() => {
    return currentRow ? calculateFactoryCycle(currentRow, prices) : null;
  }, [currentRow, prices]);

  const handleTokenChange = useCallback(
    (token: string) => {
      setSelectedToken(token);
      const firstLevel = rows.find((r) => r.token === token)?.level || 1;
      setSelectedLevel(firstLevel);
    },
    [rows],
  );

  const handleLevelChange = useCallback((level: number) => {
    setSelectedLevel(level);
  }, []);

  return {
    language,
    loading,
    selectedToken,
    selectedLevel,
    uniqueTokens,
    availableLevels,
    cycle,
    handleTokenChange,
    handleLevelChange,
  };
}
