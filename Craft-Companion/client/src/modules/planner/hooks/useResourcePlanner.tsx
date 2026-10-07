import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { extractPriceMap } from '../../../services/priceService';
import { buildRecipeTree, flattenRecipeToBaseResources } from '../../../services/craftworldCalculations';
import { ResourceIcon } from '../../../components/GameIcon';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import { useAppStore } from '../../../store/useAppStore';
import type {
  PlannerViewTab,
  MaterialFilter,
  UseResourcePlannerReturn,
} from '../types';
import {
  extractCraftingSteps,
  computeKpiStats,
  buildMaterialEntries,
  buildMissingClipboardText,
} from '../services/plannerService';

export function useResourcePlanner(): UseResourcePlannerReturn {
  const { data: home, isLoading: isHomeLoading } = useCraftworldHomeQuery();
  const { data: rows = [], isLoading: isRowsLoading } = useFactoryDataQuery();
  const loading = isHomeLoading || isRowsLoading;

  const favorites = useAppStore((state) => state.favorites);
  const [targetToken, setTargetToken] = useState('STEEL');
  const [targetAmount, setTargetAmount] = useState(10);
  const [viewTab, setViewTab] = useState<PlannerViewTab>('materials');
  const [materialFilter, setMaterialFilter] = useState<MaterialFilter>('all');
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    if (rows.length > 0 && targetToken === 'STEEL') {
      const preferred = favorites.find((f) => rows.some((r) => (r.output_token || r.token) === f));
      if (preferred) {
        setTargetToken(preferred);
      } else if (!rows.some((r) => (r.output_token || r.token) === 'STEEL')) {
        const defaultTok = rows[0].output_token || rows[0].token;
        setTargetToken(defaultTok);
      }
    }
  }, [rows, targetToken, favorites]);

  const prices = useMemo(() => extractPriceMap(home), [home]);

  const userResources = useMemo(() => {
    const resMap: Record<string, number> = {};
    if (home?.craftWorld?.resources) {
      home.craftWorld.resources.forEach((r: any) => {
        resMap[(r.symbol || '').toUpperCase()] = r.amount || 0;
      });
    }
    return resMap;
  }, [home]);

  const uniqueTokens = useMemo(() => {
    return Array.from(
      new Set(rows.map((r) => r.output_token || r.token)),
    ).filter(Boolean);
  }, [rows]);

  const tokenOptions = useMemo(() => {
    return uniqueTokens.map((tok) => ({
      value: tok,
      label: tok,
      icon: <ResourceIcon symbol={tok} size={18} />,
    }));
  }, [uniqueTokens]);

  const tree = useMemo(() => {
    return buildRecipeTree(rows, targetToken, targetAmount);
  }, [rows, targetToken, targetAmount]);

  const baseRequirements = useMemo(() => {
    return flattenRecipeToBaseResources(tree);
  }, [tree]);

  const craftingSteps = useMemo(() => {
    return extractCraftingSteps(tree);
  }, [tree]);

  const kpiStats = useMemo(() => {
    return computeKpiStats(baseRequirements, userResources, prices);
  }, [baseRequirements, userResources, prices]);

  const filteredMaterialEntries = useMemo(() => {
    return buildMaterialEntries(
      baseRequirements,
      userResources,
      prices,
      materialFilter,
    );
  }, [baseRequirements, userResources, prices, materialFilter]);

  const handleCopyMissing = useCallback(() => {
    const textToCopy = buildMissingClipboardText(
      baseRequirements,
      userResources,
      targetToken,
      targetAmount,
    );
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  }, [baseRequirements, userResources, targetToken, targetAmount]);

  return {
    loading,
    targetToken,
    setTargetToken,
    targetAmount,
    setTargetAmount,
    tokenOptions,
    userResources,
    kpiStats,
    viewTab,
    setViewTab,
    materialFilter,
    setMaterialFilter,
    craftingSteps,
    filteredMaterialEntries,
    copiedNotification,
    handleCopyMissing,
  };
}
