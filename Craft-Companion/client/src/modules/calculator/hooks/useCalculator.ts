import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import type { FactoryDataRow } from '../../../services/factoryData';
import {
  calculateFactoryCycle,
  type FactoryCycleResult,
  type RuntimeContext,
  getWorkshopSpeedBoostPercent,
  getMasteryInputReductionPercent,
} from '../../../services/craftworldCalculations';
import { extractPriceMap } from '../../../services/priceService';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import { useAppStore } from '../../../store/useAppStore';
import {
  extractUniqueTokens,
  getAvailableLevels,
  resolveCurrentRow,
} from '../services/calculatorService';
import {
  extractPlotFactoriesMap,
  type PlotFactoryInstanceDetail,
} from '../../profitability/services/cycleAdjuster';
import type { SimulationMode, ModifierBadgeInfo } from '../../profitability/types';

export function useCalculator() {
  const { language } = useTranslation();
  const { data: home, isLoading: isHomeLoading } = useCraftworldHomeQuery();
  const { data: rows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const loading = isHomeLoading || isRowsLoading;

  const favorites = useAppStore((state) => state.favorites);
  const [selectedToken, setSelectedToken] = useState<string>('STEEL');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('active_owned');

  const plotFactoriesMap = useMemo(() => extractPlotFactoriesMap(home), [home]);
  const isNoAdsActive = Boolean(home?.purchases?.isNoAdsActive);
  const homeData = useMemo(() => {
    const rawHome = home as any;
    return {
      workshop: rawHome?.craft?.workshop || rawHome?.craftWorld?.workshop || [],
      proficiencies: rawHome?.craft?.proficiencies || rawHome?.craftWorld?.proficiencies || [],
    };
  }, [home]);

  // When rows load or token changes, check if the player owns this factory in an active plot
  useEffect(() => {
    if (rows.length > 0 && selectedToken === 'STEEL') {
      const preferred = favorites.find((f) => rows.some((r) => r.token === f));
      if (preferred) {
        setSelectedToken(preferred);
        const owned = plotFactoriesMap.get(preferred);
        if (owned) setSelectedLevel(owned.level);
      } else if (!rows.some((r) => r.token === 'STEEL')) {
        setSelectedToken(rows[0].token);
        const owned = plotFactoriesMap.get(rows[0].token);
        if (owned) setSelectedLevel(owned.level);
      } else {
        const owned = plotFactoriesMap.get('STEEL');
        if (owned) setSelectedLevel(owned.level);
      }
    }
  }, [rows, selectedToken, favorites, plotFactoriesMap]);

  const prices = useMemo(() => extractPriceMap(home), [home]);
  const uniqueTokens = useMemo(() => extractUniqueTokens(rows), [rows]);
  const availableLevels = useMemo(
    () => getAvailableLevels(rows, selectedToken),
    [rows, selectedToken],
  );

  const activePlotDetail: PlotFactoryInstanceDetail | undefined = useMemo(() => {
    return plotFactoriesMap.get(selectedToken);
  }, [plotFactoriesMap, selectedToken]);

  const currentRow = useMemo(
    () => resolveCurrentRow(rows, selectedToken, selectedLevel),
    [rows, selectedToken, selectedLevel],
  );

  // Compute modifiers & context based on simulationMode
  const { context, modifiers } = useMemo(() => {
    const mods: ModifierBadgeInfo[] = [];

    if (simulationMode === 'base') {
      return {
        context: {
          workshop: [],
          proficiencies: [],
          activeBoostMultiplier: 1,
        } as RuntimeContext,
        modifiers: mods,
      };
    }

    if (simulationMode === 'active_owned') {
      let activeBoost = isNoAdsActive ? 2 : 1;
      if (activePlotDetail?.boosters && activePlotDetail.boosters.length > 0) {
        const hasActiveBooster = activePlotDetail.boosters.some((b) => (b.boostValue || 0) > 0);
        if (hasActiveBooster) {
          activeBoost = Math.max(activeBoost, 2);
          mods.push({
            type: 'booster',
            label: '⚡ Booster x2',
            detail: language === 'es' ? 'Acelerador x2 de parcela activo' : '2x speed booster active on plot',
          });
        }
      }

      let workersPct = 0;
      if (activePlotDetail?.workerBoostIntervals && activePlotDetail.workerBoostIntervals.length > 0) {
        const sumBonus = activePlotDetail.workerBoostIntervals.reduce(
          (sum, w) => sum + (w.boostValue || 0),
          0,
        );
        workersPct = sumBonus * 100;
        if (workersPct > 0) {
          mods.push({
            type: 'worker',
            label: `👷 Trabajadores (-${workersPct.toFixed(0)}%)`,
            detail: language === 'es' ? 'Reducción de intervalo por obreros asignados' : 'Worker speed bonus',
          });
        }
      }

      const workshopPct = getWorkshopSpeedBoostPercent(selectedToken, homeData.workshop);
      if (workshopPct > 0) {
        mods.push({
          type: 'workshop',
          label: `🛠️ Taller (+${workshopPct}%)`,
          detail: language === 'es' ? 'Velocidad pasiva de taller' : 'Workshop speed bonus',
        });
      }

      const masteryRed = getMasteryInputReductionPercent(selectedToken, homeData.proficiencies);
      if (masteryRed > 0) {
        mods.push({
          type: 'mastery',
          label: `🎓 Maestría (+${masteryRed.toFixed(0)}%)`,
          detail: language === 'es' ? 'Reducción de consumo por nivel de maestría' : 'Mastery consumption discount',
        });
      }

      return {
        context: {
          workshop: homeData.workshop,
          proficiencies: homeData.proficiencies,
          activeBoostMultiplier: activeBoost,
          workersPercent: workersPct,
        } as RuntimeContext,
        modifiers: mods,
      };
    }

    // projected mode:
    const activeBoost = isNoAdsActive ? 2 : 1;
    if (activeBoost > 1) {
      mods.push({
        type: 'booster',
        label: '⚡ Sin Anuncios (x2)',
        detail: language === 'es' ? 'Booster global de cuenta' : 'Global account booster',
      });
    }

    const workshopPct = getWorkshopSpeedBoostPercent(selectedToken, homeData.workshop);
    if (workshopPct > 0) {
      mods.push({
        type: 'workshop',
        label: `🛠️ Taller (+${workshopPct}%)`,
        detail: language === 'es' ? 'Velocidad pasiva de taller' : 'Workshop speed bonus',
      });
    }

    const masteryRed = getMasteryInputReductionPercent(selectedToken, homeData.proficiencies);
    if (masteryRed > 0) {
      mods.push({
        type: 'mastery',
        label: `🎓 Maestría (+${masteryRed.toFixed(0)}%)`,
        detail: language === 'es' ? 'Reducción de consumo por maestría' : 'Mastery discount',
      });
    }

    return {
      context: {
        workshop: homeData.workshop,
        proficiencies: homeData.proficiencies,
        activeBoostMultiplier: activeBoost,
      } as RuntimeContext,
      modifiers: mods,
    };
  }, [simulationMode, isNoAdsActive, activePlotDetail, selectedToken, homeData, language]);

  const cycle: FactoryCycleResult | null = useMemo(() => {
    return currentRow ? calculateFactoryCycle(currentRow, prices, context) : null;
  }, [currentRow, prices, context]);

  const handleTokenChange = useCallback(
    (token: string) => {
      setSelectedToken(token);
      const owned = plotFactoriesMap.get(token);
      if (owned && simulationMode === 'active_owned') {
        setSelectedLevel(owned.level);
      } else {
        const firstLevel = rows.find((r) => r.token === token)?.level || 1;
        setSelectedLevel(firstLevel);
      }
    },
    [rows, plotFactoriesMap, simulationMode],
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
    simulationMode,
    setSimulationMode,
    activePlotDetail,
    modifiers,
    handleTokenChange,
    handleLevelChange,
  };
}
