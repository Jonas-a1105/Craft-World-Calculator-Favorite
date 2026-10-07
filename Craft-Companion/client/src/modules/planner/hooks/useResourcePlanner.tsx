import { useEffect, useState, useMemo, useCallback } from 'react';
import type { FactoryDataRow } from '../../../services/factoryData';
import { loadFactoryData } from '../../../services/factoryData';
import { getCraftworldHome } from '../../../services/api';
import { extractPriceMap } from '../../../services/priceService';
import { buildRecipeTree, flattenRecipeToBaseResources } from '../../../services/craftworldCalculations';
import { ResourceIcon } from '../../../components/GameIcon';
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
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [targetToken, setTargetToken] = useState('STEEL');
  const [targetAmount, setTargetAmount] = useState(10);
  const [userResources, setUserResources] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [viewTab, setViewTab] = useState<PlannerViewTab>('materials');
  const [materialFilter, setMaterialFilter] = useState<MaterialFilter>('all');
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        if (factoryRows.length > 0) {
          const defaultTok = factoryRows[0].output_token || factoryRows[0].token;
          setTargetToken(defaultTok);
        }

        const priceMap = extractPriceMap(home);
        setPrices(priceMap);

        const resMap: Record<string, number> = {};
        if (home?.craftWorld?.resources) {
          home.craftWorld.resources.forEach((r: any) => {
            resMap[(r.symbol || '').toUpperCase()] = r.amount || 0;
          });
        }
        setUserResources(resMap);
      })
      .finally(() => setLoading(false));
  }, []);

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
