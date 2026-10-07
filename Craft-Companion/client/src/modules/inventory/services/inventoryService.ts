import {
  getResourceMarketDelta,
  type PriceSnapshot,
} from '../../../services/priceHistory';
import type {
  CategoryFilterConfig,
  ValuedInventoryItem,
  ValuedInventoryResult,
} from '../types';
import type {
  CraftworldHomePayload,
  CraftworldPriceItem,
  CraftworldResourceBalance,
} from '../../../types';

export const CATEGORY_FILTERS: CategoryFilterConfig[] = [
  {
    id: 'earth',
    label: 'Tierra',
    tokens: ['EARTH', 'MUD', 'CLAY', 'SAND', 'COPPER', 'WIRE', 'STEEL', 'SCREWS', 'BOLTS'],
  },
  {
    id: 'water',
    label: 'Agua',
    tokens: ['WATER', 'SEAWATER', 'ALGAE', 'OXYGEN', 'GAS', 'FUEL', 'OIL'],
  },
  {
    id: 'fire',
    label: 'Fuego',
    tokens: ['FIRE', 'HEAT', 'LAVA', 'GLASS', 'SULFUR', 'FIBERGLASS'],
  },
  {
    id: 'combined',
    label: 'Compuestos / T3',
    tokens: [
      'SALT',
      'CERAMICS',
      'GLASS',
      'STONE',
      'STEAM',
      'CEMENT',
      'ACID',
      'SULFUR',
      'PLASTICS',
      'PLASTIC',
      'FIBERGLASS',
      'ENERGY',
      'HYDROGEN',
      'DYNAMITE',
    ],
  },
  {
    id: 'blueprints',
    label: 'Llaves y Pernos',
    tokens: ['BOLTS', 'KEY', 'CERAMICKEY', 'GLASSKEY', 'DYNOKEY'],
  },
  {
    id: 'workers',
    label: 'Nidos y Estudios',
    tokens: [
      'DUST',
      'WIRE',
      'NEST',
      'WETNEST',
      'WARMNEST',
      'DYNONEST',
      'PAPERWRAP',
      'SANDWRAP',
      'STEAMWRAP',
      'BOOK',
      'ARTICLE',
      'DIPLOMA',
    ],
  },
  {
    id: 'banner',
    label: 'Construcción / Estandarte',
    tokens: ['LUMBER', 'BEAM', 'BRICK', 'TILE', 'NAIL', 'PAINT'],
  },
];

export function extractRecommendations(
  homeData?: CraftworldHomePayload | null,
): Record<string, string> {
  const recMap: Record<string, string> = {};
  if (homeData?.priceList?.prices && Array.isArray(homeData.priceList.prices)) {
    homeData.priceList.prices.forEach((p: CraftworldPriceItem) => {
      if (p.referenceSymbol && p.recommendation) {
        recMap[p.referenceSymbol.toUpperCase()] = p.recommendation;
      }
    });
  }
  return recMap;
}

export function createPriceSnapshots(
  homeData?: CraftworldHomePayload | null,
  nowIso = new Date().toISOString(),
): PriceSnapshot[] {
  if (!homeData?.priceList?.prices || !Array.isArray(homeData.priceList.prices)) {
    return [];
  }
  return homeData.priceList.prices.map((p: CraftworldPriceItem) => ({
    symbol: String(p.referenceSymbol || '').toUpperCase(),
    sellPriceCoin: p.amount ?? 0,
    buyPriceCoin: p.amount ?? 0,
    timestamp: nowIso,
    source: 'game',
    stale: false,
  }));
}

export function calculateValuedInventory(
  resources: CraftworldResourceBalance[] | undefined,
  prices: Record<string, number>,
  recMap: Record<string, string> = {},
  history: PriceSnapshot[] = [],
): ValuedInventoryResult {
  let totalValue = 0;
  const valuedItems: ValuedInventoryItem[] = (resources || []).map((r: CraftworldResourceBalance) => {
    const sym = (r?.symbol || '').toUpperCase();
    const unitPrice = prices[sym] || 0;
    const amount = typeof r?.amount === 'number' ? r.amount : 0;
    const itemValue = amount * unitPrice;
    totalValue += itemValue;
    const delta = getResourceMarketDelta(history, sym, recMap[sym]);
    return {
      symbol: r?.symbol || '',
      amount,
      unitPrice,
      totalValue: itemValue,
      recommendation: recMap[sym] || '',
      delta,
    };
  });

  valuedItems.sort((a, b) => b.totalValue - a.totalValue);

  return { valuedItems, totalValue };
}

export function filterValuedItems(
  items: ValuedInventoryItem[],
  activeCategory: string | null,
): ValuedInventoryItem[] {
  if (!activeCategory) return items;
  const cat = CATEGORY_FILTERS.find((c) => c.id === activeCategory);
  if (!cat) return items;
  return items.filter((item) => cat.tokens.includes((item.symbol || '').toUpperCase()));
}
