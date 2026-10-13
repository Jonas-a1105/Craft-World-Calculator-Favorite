// Infraestructura: cliente HTTP de GeckoTerminal para el pool COIN de Ronin.
// Única responsabilidad: transporte (fetch + JSON). Sin mapeo de dominio,
// sin valores por defecto, sin caché — eso vive en la capa de aplicación.
import { GECKOTERMINAL_API_URL, type ChartTimeframe } from './coinTypes';

/**
 * Atributos crudos del pool tal como los devuelve la API externa.
 * El tipado es deliberadamente laxo (payload externo no versionado):
 * el mapeo a CoinMarketData y los valores por defecto se resuelven en
 * coinPriceService (capa de aplicación).
 */
export type GeckoPoolAttributes = Record<string, any>;

export async function fetchCoinPoolAttributes(): Promise<GeckoPoolAttributes> {
  const res = await fetch(GECKOTERMINAL_API_URL, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`GeckoTerminal API returned HTTP ${res.status}`);
  }

  const json = await res.json();
  const attrs = json?.data?.attributes;
  if (!attrs) {
    throw new Error('Malformed GeckoTerminal payload');
  }
  return attrs as GeckoPoolAttributes;
}

function ohlcvEndpoint(timeframe: ChartTimeframe): string {
  switch (timeframe) {
    case '1H':
      return `${GECKOTERMINAL_API_URL}/ohlcv/minute?aggregate=5&limit=12`;
    case '24H':
      return `${GECKOTERMINAL_API_URL}/ohlcv/hour?limit=24`;
    case '7D':
      return `${GECKOTERMINAL_API_URL}/ohlcv/hour?aggregate=4&limit=42`;
    case '30D':
      return `${GECKOTERMINAL_API_URL}/ohlcv/day?limit=30`;
    case 'ALL':
      return `${GECKOTERMINAL_API_URL}/ohlcv/day?limit=90`;
  }
}

/**
 * Devuelve filas OHLCV crudas en orden cronológico:
 * [timestamp_seg, open, high, low, close, volume][]
 */
export async function fetchOhlcvRows(timeframe: ChartTimeframe): Promise<number[][]> {
  const res = await fetch(ohlcvEndpoint(timeframe), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`OHLCV API error ${res.status}`);
  }

  const json = await res.json();
  const ohlcvList: number[][] | undefined = json?.data?.attributes?.ohlcv_list;

  if (!Array.isArray(ohlcvList) || ohlcvList.length === 0) {
    throw new Error('Empty OHLCV data');
  }

  // GeckoTerminal returns newest first [timestamp, open, high, low, close, volume], so reverse to chronological
  return [...ohlcvList].reverse();
}
