import type { CraftworldHomePayload, CraftworldPriceItem } from '../types';

export type LivePriceResult = {
  symbol: string;
  buyPriceCoin?: number;
  sellPriceCoin?: number;
  usdPrice?: number;
  timestamp: string;
  source: string;
  stale: boolean;
  error?: string;
};

export async function fetchLiveTokenPrice(symbol: string): Promise<LivePriceResult> {
  const normalized = symbol.trim().toUpperCase();
  return {
    symbol: normalized,
    timestamp: new Date().toISOString(),
    source: 'unavailable',
    stale: true,
    error: 'Quote API not available with current OAuth scope',
  };
}

export async function fetchLiveTokenPrices(symbols: string[]) {
  const uniqueSymbols = Array.from(
    new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean)),
  );
  const results = await Promise.all(uniqueSymbols.map((symbol) => fetchLiveTokenPrice(symbol)));
  return results.reduce<Record<string, LivePriceResult>>((acc, result) => {
    acc[result.symbol] = result;
    return acc;
  }, {});
}

// Precios base por defecto calculados a partir de los costos intrínsecos de crafteo y mercado
export const DEFAULT_MARKET_PRICES: Record<string, number> = {
  COIN: 1,
  EARTH: 0.00394,
  WATER: 0.00394,
  FIRE: 0.00394,
  MUD: 0.01182,
  CLAY: 0.1182,
  SAND: 0.3546,
  COPPER: 10.64,
  SEAWATER: 0.02101,
  HEAT: 0.02364,
  ALGAE: 0.07308,
  LAVA: 0.08224,
  CERAMICS: 30.89,
  STEEL: 42.55,
  OXYGEN: 0.1906,
  GLASS: 55.67,
  GAS: 0.3317,
  STONE: 92.71,
  STEAM: 0.6176,
  SCREWS: 102.1,
  FUEL: 0.8657,
  CEMENT: 510.7,
  OIL: 2.26,
  ACID: 179.2,
  SULFUR: 296.9,
  PLASTICS: 1645,
  FIBERGLASS: 1001,
  ENERGY: 5.412,
  HYDROGEN: 13.18,
  DYNAMITE: 5474,
  BOLTS: 177.7,
  KEY: 485.1,
  CERAMICKEY: 1059,
  GLASSKEY: 989.4,
  DYNOKEY: 4486,
};

export function extractPriceMap(home?: CraftworldHomePayload | null): Record<string, number> {
  const map: Record<string, number> = {
    ...DEFAULT_MARKET_PRICES,
  };
  if (home?.priceList?.prices && Array.isArray(home.priceList.prices)) {
    home.priceList.prices.forEach((p: CraftworldPriceItem) => {
      if (typeof p.amount === 'number' && p.amount > 0 && p.referenceSymbol) {
        map[p.referenceSymbol.toUpperCase()] = p.amount;
      }
    });
  }
  return map;
}
