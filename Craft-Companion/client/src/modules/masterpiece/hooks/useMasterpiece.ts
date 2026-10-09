import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCraftworldHomeQuery } from '../../../services/queries/useCraftworldQueries';
import type {
  MasterpieceLeagueId,
  ContributionTierId,
  EfficiencyItem,
  TierContributionItem,
  MasterpieceLeagueInfo,
} from '../types';
import {
  MASTERPIECE_LEAGUES,
  MASTERPIECE_RESOURCES,
} from '../data/masterpieceData';
import {
  computeEfficiencyList,
  computeTierContributions,
} from '../services/masterpieceCalculator';
import {
  loadStoredContributions,
  saveStoredContributions,
  loadStoredPowerPrice,
  saveStoredPowerPrice,
} from '../services/masterpieceStorage';

export function useMasterpiece() {
  const { language } = useTranslation();
  const { data: home, isLoading: loading } = useCraftworldHomeQuery();

  const [activeLeague, setActiveLeague] = useState<MasterpieceLeagueId>('gold');
  const [activeTier, setActiveTier] = useState<ContributionTierId>('250%');
  const [search, setSearch] = useState('');
  const [powerPricePer100k, setPowerPricePer100kState] = useState<number>(() =>
    loadStoredPowerPrice(),
  );
  const [globalMultiplier, setGlobalMultiplier] = useState<number>(1);
  const [resourceMultipliers, setResourceMultipliers] = useState<Record<string, number>>({});
  const [userContributions, setUserContributions] = useState<Record<string, number>>(() =>
    loadStoredContributions(),
  );
  const [resourceUnits, setResourceUnits] = useState<Record<string, number>>({});
  const [resourceBrackets, setResourceBrackets] = useState<Record<string, number>>({});

  const setPowerPricePer100k = useCallback((val: number) => {
    setPowerPricePer100kState(val);
    saveStoredPowerPrice(val);
  }, []);

  const updateContribution = useCallback((symbol: string, amount: number) => {
    setUserContributions((prev) => {
      const updated = { ...prev, [symbol.toUpperCase()]: Math.max(0, amount) };
      saveStoredContributions(updated);
      return updated;
    });
  }, []);

  const setMultiplierForResource = useCallback((symbol: string, multiplier: number) => {
    setResourceMultipliers((prev) => ({
      ...prev,
      [symbol.toUpperCase()]: multiplier,
    }));
  }, []);

  const updateResourceUnits = useCallback((symbol: string, units: number) => {
    setResourceUnits((prev) => ({
      ...prev,
      [symbol.toUpperCase()]: Math.max(1, Math.floor(units || 1)),
    }));
  }, []);

  const updateResourceBracket = useCallback((symbol: string, bracketIdx: number) => {
    setResourceBrackets((prev) => ({
      ...prev,
      [symbol.toUpperCase()]: Math.max(0, bracketIdx),
    }));
  }, []);

  // Map live prices from API
  const marketPriceMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    const prices = home?.priceList?.prices || [];
    for (const p of prices) {
      if (p.referenceSymbol) {
        map[p.referenceSymbol.toUpperCase()] = p.amount ?? 0;
      }
    }
    return map;
  }, [home]);

  // Current selected league object
  const currentLeagueInfo = useMemo<MasterpieceLeagueInfo>(() => {
    const found = MASTERPIECE_LEAGUES.find((l) => l.id === activeLeague);
    return found || MASTERPIECE_LEAGUES[3]; // default Gold
  }, [activeLeague]);

  // Calculated tier contributions list
  const tierContributions = useMemo<TierContributionItem[]>(() => {
    return computeTierContributions(
      MASTERPIECE_RESOURCES,
      activeTier,
      userContributions,
      language,
    );
  }, [activeTier, userContributions, language]);

  // Calculated efficiency list
  const allEfficiencies = useMemo<EfficiencyItem[]>(() => {
    return computeEfficiencyList(
      MASTERPIECE_RESOURCES,
      marketPriceMap,
      powerPricePer100k,
      resourceMultipliers,
      globalMultiplier,
      resourceUnits,
      resourceBrackets,
      language,
    );
  }, [
    marketPriceMap,
    powerPricePer100k,
    resourceMultipliers,
    globalMultiplier,
    resourceUnits,
    resourceBrackets,
    language,
  ]);

  // Filtered by search query
  const filteredEfficiencies = useMemo<EfficiencyItem[]>(() => {
    if (!search.trim()) return allEfficiencies;
    const q = search.trim().toLowerCase();
    return allEfficiencies.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q),
    );
  }, [allEfficiencies, search]);

  return {
    language,
    loading,
    activeLeague,
    setActiveLeague,
    currentLeagueInfo,
    leagues: MASTERPIECE_LEAGUES,
    activeTier,
    setActiveTier,
    tierContributions,
    search,
    setSearch,
    powerPricePer100k,
    setPowerPricePer100k,
    globalMultiplier,
    setGlobalMultiplier,
    resourceMultipliers,
    setMultiplierForResource,
    resourceUnits,
    updateResourceUnits,
    resourceBrackets,
    updateResourceBracket,
    userContributions,
    updateContribution,
    efficiencies: filteredEfficiencies,
    totalEfficiencyCount: allEfficiencies.length,
    baseSymbol: home?.priceList?.baseSymbol || 'COIN',
  };
}
