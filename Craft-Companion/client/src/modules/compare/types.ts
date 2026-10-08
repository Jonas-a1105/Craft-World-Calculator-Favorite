import type { ReactNode } from 'react';
import type { FactoryDataRow } from '../../services/factoryData';
import type { FactoryCycleResult } from '../../services/craftworldCalculations';

export type ComparisonWinner = 'A' | 'B' | 'TIE';

export interface ComparisonVerdict {
  profitWinner: ComparisonWinner;
  profitDiffDay: number;
  profitDiffAbs: number;
  profitPercent: number;
  outputWinner: ComparisonWinner;
  outputDiffDay: number;
  xpWinner: ComparisonWinner;
  xpDiffDay: number;
  timeWinner: ComparisonWinner;
  isSameFactory: boolean;
}

export interface UseFactoryCompareReturn {
  loading: boolean;
  token1: string;
  setToken1: (tok: string) => void;
  level1: number;
  setLevel1: (lvl: number | ((prev: number) => number)) => void;
  token2: string;
  setToken2: (tok: string) => void;
  level2: number;
  setLevel2: (lvl: number | ((prev: number) => number)) => void;
  tokenOptions: Array<{ value: string; label: string; icon: ReactNode }>;
  availableLevels1: number[];
  levelOptions1: Array<{ value: number; label: string }>;
  availableLevels2: number[];
  levelOptions2: Array<{ value: number; label: string }>;
  userFactories: Record<string, number>;
  cycle1: FactoryCycleResult | null;
  cycle2: FactoryCycleResult | null;
  comparisonVerdict: ComparisonVerdict | null;
  withPlayerBonuses: boolean;
  setWithPlayerBonuses: (val: boolean) => void;
  handleSwap: () => void;
  handleCompareNextLevel: () => void;
  handleCompareMaxLevel: () => void;
}

