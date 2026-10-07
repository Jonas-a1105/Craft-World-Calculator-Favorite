import type { FactoryDataRow } from '../../services/factoryData';

export type MatrixViewMode = 'matrix' | 'table';

export type FactoryBoostMode = 'none' | '2x' | '3.6x' | '5x';

export interface MatrixCategory {
  label: string;
  color: string;
  border: string;
  bg: string;
  resources: string[];
}

export interface MatrixCellProfit {
  profit: number;
  valid: boolean;
  runtime: number;
}

export interface UseMatrixReturn {
  loading: boolean;
  viewMode: MatrixViewMode;
  setViewMode: (mode: MatrixViewMode) => void;
  adBoost2x: boolean;
  setAdBoost2x: (val: boolean | ((prev: boolean) => boolean)) => void;
  factoryBoost: FactoryBoostMode;
  setFactoryBoost: (boost: FactoryBoostMode) => void;
  buySlippage: boolean;
  setBuySlippage: (val: boolean | ((prev: boolean) => boolean)) => void;
  sellSlippage: boolean;
  setSellSlippage: (val: boolean | ((prev: boolean) => boolean)) => void;
  powerPrice: number;
  setPowerPrice: (price: number) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  priceMap: Record<string, number>;
  setPriceMap: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleResetPrices: () => void;
  masteryMap: Record<string, number>;
  setMasteryForResource: (resource: string, level: number) => void;
  openMasteryRes: string | null;
  setOpenMasteryRes: (res: string | null) => void;
  tableSearch: string;
  setTableSearch: (query: string) => void;
  visibleResources: string[];
  availableResources: string[];
  levels: number[];
  rows: FactoryDataRow[];
  boostOptions: Array<{ value: string; label: string }>;
  getCellProfit: (resource: string, level: number) => MatrixCellProfit;
}
