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
