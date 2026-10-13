// Infraestructura: acceso a cotizaciones del DEX Ronin (Katana V3).
// Razón de cambio única: proveedor externo (caché de pools, endpoints, disponibilidad).
// Sin reglas de negocio ni formateo de UI.
import { getCachedRoninPools, getLatestPoolPrice } from './roninPoolsService';

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
