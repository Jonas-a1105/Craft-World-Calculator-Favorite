import type { CraftworldHomePayload, CraftworldPriceItem } from '../types';
import { getCachedRoninPools, getLatestPoolPrice, type RoninPoolsDataset } from './roninPoolsService';

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
  const pool = getCachedRoninPools()?.resources?.[normalized];
  if (pool) {
    const price = getLatestPoolPrice(pool);
    if (price > 0) {
      return {
        symbol: normalized,
        buyPriceCoin: price,
        sellPriceCoin: price,
        timestamp: new Date().toISOString(),
        source: 'katana-v3',
        stale: false,
      };
    }
  }

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

// Precios de mercado base reales extraídos de Katana V3 (Ronin DEX)
export const DEFAULT_MARKET_PRICES: Record<string, number> = {
  COIN: 1,
  EARTH: 0.004608,
  WATER: 2.30,
  FIRE: 10.63,
  MUD: 0.01,
  CLAY: 0.13,
  SAND: 0.36,
  COPPER: 10.19,
  SEAWATER: 13.29,
  HEAT: 68.73,
  ALGAE: 43.49,
  LAVA: 230.03,
  CERAMICS: 68.67,
  STEEL: 47.11,
  OXYGEN: 110.29,
  GLASS: 541.96,
  GAS: 207.98,
  STONE: 177.15,
  STEAM: 1044.71,
  SCREWS: 108.73,
  FUEL: 554.53,
  CEMENT: 1193.08,
  OIL: 1454.51,
  ACID: 1060.93,
  SULFUR: 2340.14,
  PLASTICS: 5235.61,
  FIBERGLASS: 8221.25,
  ENERGY: 6804.29,
  HYDROGEN: 14768.02,
  DYNAMITE: 25749.15,
  BOLTS: 166.72,
  KEY: 312.09,
  CERAMICKEY: 891.33,
  GLASSKEY: 1863.1,
  DYNOKEY: 5588.51,
  DUST: 5.16,
  BOOK: 23.77,
  SALT: 134.9,
  ARTICLE: 303.27,
  DIPLOMA: 1004.16,
  WIRE: 11.33,
  NEST: 22.91,
  WETNEST: 360.66,
  WARMNEST: 443.59,
  DYNONEST: 1511.18,
  PAPERWRAP: 9.95,
  SANDWRAP: 50.19,
  STEAMWRAP: 5031.51,
  LUMBER: 0.1,
  BEAM: 0.47,
  BRICK: 2.8,
  TILE: 245.98,
  NAIL: 379.71,
  PAINT: 2487.58,
};

export function extractPriceMap(
  home?: CraftworldHomePayload | null,
  poolsDataset?: RoninPoolsDataset | null,
): Record<string, number> {
  const map: Record<string, number> = {
    ...DEFAULT_MARKET_PRICES,
  };

  // 1. Integrar cotizaciones en vivo de Katana V3 DEX (ronin pools)
  const pools = poolsDataset || getCachedRoninPools();
  if (pools?.resources) {
    for (const [sym, item] of Object.entries(pools.resources)) {
      const latest = getLatestPoolPrice(item);
      if (latest > 0) {
        map[sym.toUpperCase()] = latest;
      }
    }
  }

  // 2. Fusionar cotizaciones desde el servidor del juego (si la sesión está activa y tiene datos válidos)
  if (home?.priceList?.prices && Array.isArray(home.priceList.prices)) {
    home.priceList.prices.forEach((p: CraftworldPriceItem) => {
      if (typeof p.amount === 'number' && p.amount > 0 && p.referenceSymbol) {
        map[p.referenceSymbol.toUpperCase()] = p.amount;
      }
    });
  }

  return map;
}
