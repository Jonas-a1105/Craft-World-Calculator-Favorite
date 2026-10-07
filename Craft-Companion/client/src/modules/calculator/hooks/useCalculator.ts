import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../../../services/factoryData';
import { calculateFactoryCycle, FactoryCycleResult } from '../../../services/craftworldCalculations';
import { getCraftworldHome } from '../../../services/api';
import { extractPriceMap } from '../../../services/priceService';
import {
  extractUniqueTokens,
  getAvailableLevels,
  resolveCurrentRow,
} from '../services/calculatorService';

export function useCalculator() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('STEEL');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        if (factoryRows.length > 0) {
          setSelectedToken(factoryRows[0].token);
        }
        setPrices(extractPriceMap(home));
      })
      .finally(() => setLoading(false));
  }, []);

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
