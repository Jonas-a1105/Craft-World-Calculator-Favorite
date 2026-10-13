// Aplicación: orquestación del precio de mercado de COIN.
// Coordina las capas sin mezclar responsabilidades:
//  - Infra (HTTP):          coin/geckoTerminalClient (fetch + JSON)
//  - Infra (persistencia):  coin/coinCache (localStorage)
//  - Presentación:          coin/coinFormatters (mapeo a puntos de gráfico)
//  - Dominio:               coin/coinChartGenerator (грáfico sintético — solo
//    uso offline/demo explícito; NUNCA se usa como sustituto silencioso de
//    datos de mercado reales en la UI).
// Política de confianza: la app nunca presenta datos fabricados como "en vivo".
// Si el fetch falla se devuelve caché etiquetada (source: 'cache') o null.
import { useQuery } from '@tanstack/react-query';
import {
  GECKOTERMINAL_RONIN_COIN_POOL,
  type ChartTimeframe,
  type CoinChartPoint,
  type CoinMarketData,
} from './coin/coinTypes';
import { fetchCoinPoolAttributes, fetchOhlcvRows } from './coin/geckoTerminalClient';
import { getCachedCoinData, setCachedCoinData } from './coin/coinCache';
import { mapOhlcvToChartPoints } from './coin/coinFormatters';

// Re-export everything from dedicated sub-modules for clean public API
export * from './coin/coinTypes';
export * from './coin/coinFormatters';
export * from './coin/coinConversion';
export * from './coin/coinChartGenerator';
export { getCachedCoinData } from './coin/coinCache';

export async function fetchCoinMarketData(): Promise<CoinMarketData | null> {
  try {
    const attrs = await fetchCoinPoolAttributes();

    // Los campos centrales son obligatorios: si faltan, la respuesta no es
    // confiable → tratamos la respuesta como fallo y caemos a caché/null.
    const priceUsd = parseFloat(attrs.base_token_price_usd);
    const quotePriceUsd = parseFloat(attrs.quote_token_price_usd);
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
      throw new Error('Invalid COIN pool payload (priceUsd)');
    }
    const safeQuoteUsd = Number.isFinite(quotePriceUsd) && quotePriceUsd > 0 ? quotePriceUsd : 0;

    const priceInRon =
      parseFloat(attrs.base_token_price_quote_token) ||
      (safeQuoteUsd > 0 ? priceUsd / safeQuoteUsd : 0);
    const ronInCoin =
      parseFloat(attrs.quote_token_price_base_token) ||
      (priceInRon > 0 ? 1 / priceInRon : 0);

    // Campos secundarios ausentes se reportan como 0 (desconocido), no como benchmark.
    const h1Change = parseFloat(attrs.price_change_percentage?.h1 ?? '0');
    const h24Change = parseFloat(attrs.price_change_percentage?.h24 ?? '0');
    const volume24h = parseFloat(attrs.volume_usd?.h24 ?? '0') || 0;
    const reserveUsd = parseFloat(attrs.reserve_in_usd ?? '0') || 0;
    const fdvUsd = parseFloat(attrs.fdv_usd ?? '0') || 0;
    const buys24h = parseInt(attrs.transactions?.h24?.buys ?? '0', 10) || 0;
    const sells24h = parseInt(attrs.transactions?.h24?.sells ?? '0', 10) || 0;

    const data: CoinMarketData = {
      priceUsd,
      quotePriceUsd: safeQuoteUsd,
      priceInRon,
      ronInCoin,
      h1Change: isNaN(h1Change) ? 0 : h1Change,
      h24Change: isNaN(h24Change) ? 0 : h24Change,
      volume24h,
      reserveUsd,
      fdvUsd,
      buys24h,
      sells24h,
      poolAddress: attrs.address || GECKOTERMINAL_RONIN_COIN_POOL,
      poolName: attrs.name || 'COIN / WRON 1%',
      updatedAt: new Date().toISOString(),
      source: 'live',
    };

    setCachedCoinData(data);
    return data;
  } catch {
    // Sin datos en vivo: caché etiquetada o null. Nunca datos fabricados.
    return getCachedCoinData();
  }
}

export async function fetchCoinChartPoints(
  timeframe: ChartTimeframe,
  basePrice: number,
): Promise<CoinChartPoint[]> {
  try {
    const ohlcvRows = await fetchOhlcvRows(timeframe);
    return mapOhlcvToChartPoints(ohlcvRows, timeframe);
  } catch {
    // Sin historial real → lista vacía; la UI muestra "gráfica no disponible".
    return [];
  }
}

export function useCoinLivePrice() {
  return useQuery<CoinMarketData | null>({
    queryKey: ['coin-live-market-price'],
    queryFn: fetchCoinMarketData,
    initialData: getCachedCoinData,
    refetchInterval: 5000, // Refresh every 5 seconds (ultra-fast live ticker)
    staleTime: 3000,
    retry: 1,
  });
}

export function useCoinChart(timeframe: ChartTimeframe, basePrice: number) {
  return useQuery({
    queryKey: ['coin-live-chart', timeframe, basePrice],
    queryFn: () => fetchCoinChartPoints(timeframe, basePrice),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
    retry: 1,
  });
}
