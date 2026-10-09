import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../../utils/i18n';
import { useCoinLivePrice } from '../../../services/coinPriceService';
import {
  AIRSTREAM_LEVELS,
  SUNFORGE_LEVELS,
  DEFAULT_MAX_CAPACITY,
} from '../data/powerSimulatorData';
import {
  calculatePassiveHourly,
  computePowerSimulatorSummary,
  generateCostComparisonRows,
  calculateCrystalPriceInCoin,
} from '../services/powerCalculatorService';
import type { PlantState, PowerPackState } from '../types';

const STORAGE_KEYS = {
  airstream: 'cw:power-airstream',
  sunforge: 'cw:power-sunforge',
  capacity: 'cw:power-capacity',
  packs25: 'cw:packs25-per-day',
  packs50: 'cw:packs50-per-day',
  packs100: 'cw:packs100-per-day',
  crystalSub: 'cw:crystal-subscription',
};

export function usePowerSimulator() {
  const { language } = useTranslation();
  const { data: coinMarketData, isLoading: isCoinLoading } = useCoinLivePrice();
  const coinUsdPrice = coinMarketData?.priceUsd ?? null;

  // Passive plants state (default to Level 8, Count 1 as seen in the reference)
  const [airstream, setAirstream] = useState<PlantState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.airstream);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return { level: 8, count: 1 };
  });

  const [sunforge, setSunforge] = useState<PlantState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.sunforge);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return { level: 8, count: 1 };
  });

  // Power Packs state
  const [packState, setPackState] = useState<PowerPackState>(() => {
    let capacity = DEFAULT_MAX_CAPACITY;
    let packs25PerDay = 0;
    let packs50PerDay = 0;
    let packs100PerDay = 0;
    let activateCrystalPass = false;

    if (typeof window !== 'undefined') {
      try {
        const cap = localStorage.getItem(STORAGE_KEYS.capacity);
        if (cap) capacity = parseFloat(cap) || DEFAULT_MAX_CAPACITY;
        const p25 = localStorage.getItem(STORAGE_KEYS.packs25);
        if (p25) packs25PerDay = parseInt(p25, 10) || 0;
        const p50 = localStorage.getItem(STORAGE_KEYS.packs50);
        if (p50) packs50PerDay = parseInt(p50, 10) || 0;
        const p100 = localStorage.getItem(STORAGE_KEYS.packs100);
        if (p100) packs100PerDay = parseInt(p100, 10) || 0;
        const sub = localStorage.getItem(STORAGE_KEYS.crystalSub);
        if (sub) activateCrystalPass = sub === 'true';
      } catch {}
    }

    return {
      capacity,
      packs25PerDay,
      packs50PerDay,
      packs100PerDay,
      activateCrystalPass,
    };
  });

  // Sync to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.airstream, JSON.stringify(airstream));
    } catch {}
  }, [airstream]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.sunforge, JSON.stringify(sunforge));
    } catch {}
  }, [sunforge]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.capacity, packState.capacity.toString());
      localStorage.setItem(STORAGE_KEYS.packs25, packState.packs25PerDay.toString());
      localStorage.setItem(STORAGE_KEYS.packs50, packState.packs50PerDay.toString());
      localStorage.setItem(STORAGE_KEYS.packs100, packState.packs100PerDay.toString());
      localStorage.setItem(
        STORAGE_KEYS.crystalSub,
        packState.activateCrystalPass.toString(),
      );
    } catch {}
  }, [packState]);

  // Setters
  const updateAirstreamLevel = useCallback((level: number) => {
    setAirstream((prev) => ({ ...prev, level }));
  }, []);

  const updateAirstreamCount = useCallback((count: number) => {
    setAirstream((prev) => ({ ...prev, count }));
  }, []);

  const updateSunforgeLevel = useCallback((level: number) => {
    setSunforge((prev) => ({ ...prev, level }));
  }, []);

  const updateSunforgeCount = useCallback((count: number) => {
    setSunforge((prev) => ({ ...prev, count }));
  }, []);

  const updateCapacity = useCallback((capacity: number) => {
    setPackState((prev) => ({ ...prev, capacity }));
  }, []);

  const updatePacks25 = useCallback((packs25PerDay: number) => {
    setPackState((prev) => ({ ...prev, packs25PerDay }));
  }, []);

  const updatePacks50 = useCallback((packs50PerDay: number) => {
    setPackState((prev) => ({ ...prev, packs50PerDay: Math.min(1, Math.max(0, packs50PerDay)) }));
  }, []);

  const updatePacks100 = useCallback((packs100PerDay: number) => {
    setPackState((prev) => ({ ...prev, packs100PerDay }));
  }, []);

  const toggleCrystalPass = useCallback(() => {
    setPackState((prev) => ({
      ...prev,
      activateCrystalPass: !prev.activateCrystalPass,
    }));
  }, []);

  // Passive calculations
  const airstreamHourly = useMemo(
    () => calculatePassiveHourly(AIRSTREAM_LEVELS, airstream),
    [airstream],
  );

  const sunforgeHourly = useMemo(
    () => calculatePassiveHourly(SUNFORGE_LEVELS, sunforge),
    [sunforge],
  );

  // Overall summary
  const summary = useMemo(
    () =>
      computePowerSimulatorSummary(
        airstreamHourly,
        sunforgeHourly,
        packState,
        coinUsdPrice,
      ),
    [airstreamHourly, sunforgeHourly, packState, coinUsdPrice],
  );

  // Cost comparison rows
  const comparisonRows = useMemo(
    () => generateCostComparisonRows(packState.capacity, coinUsdPrice),
    [packState.capacity, coinUsdPrice],
  );

  // Crystal price in COIN
  const crystalPriceCoin = useMemo(
    () => calculateCrystalPriceInCoin(coinUsdPrice),
    [coinUsdPrice],
  );

  return {
    language,
    isCoinLoading,
    coinUsdPrice,
    crystalPriceCoin,
    airstream,
    sunforge,
    packState,
    updateAirstreamLevel,
    updateAirstreamCount,
    updateSunforgeLevel,
    updateSunforgeCount,
    updateCapacity,
    updatePacks25,
    updatePacks50,
    updatePacks100,
    toggleCrystalPass,
    airstreamHourly,
    sunforgeHourly,
    summary,
    comparisonRows,
  };
}
