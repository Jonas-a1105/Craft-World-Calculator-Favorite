import type { FactoryDataRow } from '../../../services/factoryData';
import {
  calculateFactoryRuntime,
  calculateRevenue,
  calculateInputCost,
} from '../../../services/craftworldCalculations';
import type {
  MatrixCategory,
  MatrixCellProfit,
  FactoryBoostMode,
} from '../types';

export const MINUTES_PER_HOUR = 60;

export const CATEGORIES: Record<string, MatrixCategory> = {
  Earth: {
    label: 'Earth',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    resources: ['EARTH', 'MUD', 'CLAY', 'SAND', 'COPPER', 'CERAMICS', 'STONE', 'CEMENT', 'BOLTS'],
  },
  Water: {
    label: 'Water',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    resources: ['WATER', 'SEAWATER', 'ALGAE', 'OXYGEN', 'HYDROGEN', 'SALT'],
  },
  Fire: {
    label: 'Fire',
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10 hover:bg-rose-500/20',
    resources: ['FIRE', 'HEAT', 'LAVA', 'STEEL', 'GLASS', 'STEAM', 'ENERGY'],
  },
  Special: {
    label: 'Special',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10 hover:bg-purple-500/20',
    resources: ['GAS', 'FUEL', 'OIL', 'ACID', 'SULFUR', 'PLASTICS', 'FIBERGLASS', 'DYNAMITE'],
  },
  Keys: {
    label: 'Keys',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    resources: ['KEY', 'CERAMICKEY', 'GLASSKEY', 'DYNOKEY'],
  },
  Nests: {
    label: 'Nests',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    resources: ['NEST', 'WARMNEST', 'WETNEST', 'DYNONEST'],
  },
  Wraps: {
    label: 'Wraps',
    color: 'text-lime-400',
    border: 'border-lime-500/30',
    bg: 'bg-lime-500/10 hover:bg-lime-500/20',
    resources: ['PAPERWRAP', 'SANDWRAP', 'STEAMWRAP'],
  },
  Academy: {
    label: 'Academy',
    color: 'text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    resources: ['ARTICLE', 'BOOK', 'DIPLOMA'],
  },
  Construction: {
    label: 'Construction',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10 hover:bg-orange-500/20',
    resources: ['BRICK', 'BEAM', 'TILE', 'WIRE', 'PAINT', 'NAIL', 'SCREWS'],
  },
};

export const DEFAULT_RESOURCE_ORDER: string[] = [
  'EARTH', 'MUD', 'CLAY', 'SAND', 'COPPER', 'CERAMICS', 'STONE', 'CEMENT', 'BOLTS',
  'WATER', 'SEAWATER', 'ALGAE', 'OXYGEN', 'HYDROGEN', 'SALT',
  'FIRE', 'HEAT', 'LAVA', 'STEEL', 'GLASS', 'STEAM', 'ENERGY',
  'GAS', 'FUEL', 'OIL', 'ACID', 'SULFUR', 'PLASTICS', 'FIBERGLASS', 'DYNAMITE',
  'KEY', 'CERAMICKEY', 'GLASSKEY', 'DYNOKEY',
  'NEST', 'WARMNEST', 'WETNEST', 'DYNONEST',
  'PAPERWRAP', 'SANDWRAP', 'STEAMWRAP',
  'ARTICLE', 'BOOK', 'DIPLOMA',
  'BRICK', 'BEAM', 'TILE', 'WIRE', 'PAINT', 'NAIL', 'SCREWS'
];

export function calculateSpeedMultiplier(
  adBoost2x: boolean,
  factoryBoost: FactoryBoostMode,
): number {
  let mult = 1;
  if (adBoost2x) mult *= 2;
  if (factoryBoost === '2x') mult *= 2;
  if (factoryBoost === '3.6x') mult *= 3.6;
  if (factoryBoost === '5x') mult *= 5;
  return mult;
}

export function sortResourcesByOrder(resources: string[]): string[] {
  return [...resources].sort((a, b) => {
    const idxA = DEFAULT_RESOURCE_ORDER.indexOf(a);
    const idxB = DEFAULT_RESOURCE_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function calculateProfitPerHour(
  row: FactoryDataRow | undefined,
  resource: string,
  masteryLevel: number,
  speedMultiplier: number,
  priceMap: Record<string, number>,
  buySlippageFactor: number,
  sellSlippageFactor: number,
  powerPrice: number,
  workshop?: Array<{ symbol?: string; token?: string; level?: number }>,
): MatrixCellProfit {
  if (!row) return { profit: 0, valid: false, runtime: 0 };

  const proficiencies = masteryLevel > 0 ? [{ token: resource, level: masteryLevel }] : [];
  const baseRuntime = calculateFactoryRuntime(row, { proficiencies, workshop: workshop || [] });
  const runtimeMinutes = speedMultiplier > 0 ? baseRuntime / speedMultiplier : baseRuntime;

  if (runtimeMinutes <= 0) return { profit: 0, valid: false, runtime: 0 };

  let inputCost = calculateInputCost(row, priceMap, { proficiencies }) * buySlippageFactor;
  let revenue = calculateRevenue(row, priceMap, { proficiencies }) * sellSlippageFactor;

  if (powerPrice > 0) {
    // Official power cost per cycle from Google Sheet dataset (1 battery = 100,000 power units)
    const powerUnits = row.power_cost !== undefined ? row.power_cost : runtimeMinutes * 10;
    const powerCost = (powerUnits / 100000) * powerPrice;
    inputCost += powerCost;
  }

  const profitPerCycle = revenue - inputCost;
  const profitPerHour = profitPerCycle * (MINUTES_PER_HOUR / runtimeMinutes);

  return { profit: profitPerHour, valid: true, runtime: runtimeMinutes };
}

export function formatProfit(val: number): string {
  const sign = val > 0 ? '+' : '';
  const abs = Math.abs(val);
  if (abs >= 10000) {
    return `${sign}${(val / 1000).toFixed(1)}k`;
  }
  if (abs >= 100) {
    return `${sign}${val.toFixed(0)}`;
  }
  if (abs >= 10) {
    return `${sign}${val.toFixed(1)}`;
  }
  return `${sign}${val.toFixed(2)}`;
}

export function formatCompactPrice(price: number | undefined): string {
  if (price === undefined || isNaN(price)) return '0';
  if (price >= 10000) return `${(price / 1000).toFixed(0)}k`;
  if (price >= 1000) return `${(price / 1000).toFixed(1)}k`;
  if (price >= 100) return price.toFixed(0);
  if (price >= 10) return price.toFixed(1);
  if (price >= 1) return price.toFixed(1);
  if (price >= 0.1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(2);
  if (price > 0) return price.toFixed(3);
  return '0';
}

export function getCellBgClass(profit: number, valid: boolean): string {
  if (!valid) return 'text-zinc-600 bg-transparent';
  if (profit > 50) return 'text-emerald-300 bg-emerald-500/25 font-bold';
  if (profit > 15) return 'text-emerald-400 bg-emerald-500/15 font-semibold';
  if (profit > 0) return 'text-emerald-400/90 bg-emerald-500/5';
  if (profit === 0) return 'text-zinc-400 bg-zinc-800/20';
  if (profit > -15) return 'text-rose-400/80 bg-rose-500/10';
  if (profit > -50) return 'text-rose-400 bg-rose-500/20 font-semibold';
  return 'text-rose-300 bg-rose-500/30 font-bold';
}
