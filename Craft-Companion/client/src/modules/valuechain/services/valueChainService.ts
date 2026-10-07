import type { FactoryDataRow } from '../../../services/factoryData';
import {
  computeValueChain,
  type ValueChainAnalysis,
} from '../../../services/valueChainCalculator';
import type { FeaturedTarget, ValueChainMode } from '../types';

export const FEATURED_TARGETS: FeaturedTarget[] = [
  { token: 'MUD', label: 'Barro', desc: 'Receta básica de Tierra' },
  { token: 'CLAY', label: 'Arcilla', desc: 'Barro procesado' },
  { token: 'SAND', label: 'Arena', desc: 'Arcilla refinada' },
  { token: 'COPPER', label: 'Cobre', desc: 'Arena fundida' },
  { token: 'STEEL', label: 'Acero', desc: 'Cobre aleado' },
  { token: 'SCREWS', label: 'Tornillos', desc: 'Acero forjado' },
  { token: 'GLASS', label: 'Vidrio', desc: 'Arena horneada' },
  { token: 'CEMENT', label: 'Cemento', desc: 'Mezcla de Arcilla' },
  { token: 'DYNAMITE', label: 'Dinamita', desc: 'Explosivo avanzado' },
  { token: 'CERAMICS', label: 'Cerámica', desc: 'Arcilla salada' },
];

export const DEFAULT_BASE_PRICES: Record<string, number> = {
  COIN: 1,
  EARTH: 0.00394,
  WATER: 0.00394,
  FIRE: 0.00394,
};

export function extractValueChainPrices(home: any): Record<string, number> {
  const map: Record<string, number> = { ...DEFAULT_BASE_PRICES };
  if (home?.priceList?.prices && Array.isArray(home.priceList.prices)) {
    home.priceList.prices.forEach((p: any) => {
      if (typeof p?.amount === 'number' && p.amount > 0 && p.referenceSymbol) {
        map[p.referenceSymbol.toUpperCase()] = p.amount;
      }
    });
  }
  return map;
}

export function computeValueChainAnalysis(
  token: string,
  level: number,
  rows: FactoryDataRow[],
  prices: Record<string, number>,
  proficiencies: any[] = [],
  mode: ValueChainMode = 'self_crafted',
): ValueChainAnalysis | null {
  if (!rows || rows.length === 0) return null;
  return computeValueChain(token, level, rows, prices, proficiencies, mode);
}
