import { useQuery } from '@tanstack/react-query';
import {
  DEFAULT_COIN_DATA,
  GECKOTERMINAL_API_URL,
  GECKOTERMINAL_RONIN_COIN_POOL,
  LOCAL_STORAGE_KEY,
  type CoinChartPoint,
  type CoinMarketData,
  type ChartTimeframe,
} from './coin/coinTypes';
import { formatCoinPrice } from './coin/coinFormatters';
import { generateSyntheticChart } from './coin/coinChartGenerator';

// Re-export everything from dedicated sub-modules for clean public API
export * from './coin/coinTypes';
export * from './coin/coinFormatters';
export * from './coin/coinConversion';
export * from './coin/coinChartGenerator';

export function getCachedCoinData(): CoinMarketData {
  if (typeof window === 'undefined') return DEFAULT_COIN_DATA;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.priceUsd === 'number') {
        return {
          ...DEFAULT_COIN_DATA,
          ...parsed,
          source: 'cache',
        };
      }
    }
  } catch {
    // ignore parse error
  }
  return DEFAULT_COIN_DATA;
}

export async function fetchCoinMarketData(): Promise<CoinMarketData> {
  try {
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

    const priceUsd = parseFloat(attrs.base_token_price_usd) || DEFAULT_COIN_DATA.priceUsd;
    const quotePriceUsd = parseFloat(attrs.quote_token_price_usd) || DEFAULT_COIN_DATA.quotePriceUsd;
    const priceInRon =
      parseFloat(attrs.base_token_price_quote_token) ||
      (quotePriceUsd > 0 ? priceUsd / quotePriceUsd : 0.0033895);
    const ronInCoin =
      parseFloat(attrs.quote_token_price_base_token) ||
      (priceInRon > 0 ? 1 / priceInRon : 295.027);

    const h1Change = parseFloat(attrs.price_change_percentage?.h1 ?? '0');
    const h24Change = parseFloat(attrs.price_change_percentage?.h24 ?? '0');
    const volume24h = parseFloat(attrs.volume_usd?.h24 ?? '0') || DEFAULT_COIN_DATA.volume24h;
    const reserveUsd = parseFloat(attrs.reserve_in_usd ?? '0') || DEFAULT_COIN_DATA.reserveUsd;
    const fdvUsd = parseFloat(attrs.fdv_usd ?? '0') || DEFAULT_COIN_DATA.fdvUsd;
    const buys24h = parseInt(attrs.transactions?.h24?.buys ?? '0', 10) || DEFAULT_COIN_DATA.buys24h;
    const sells24h = parseInt(attrs.transactions?.h24?.sells ?? '0', 10) || DEFAULT_COIN_DATA.sells24h;

    const data: CoinMarketData = {
      priceUsd,
      quotePriceUsd,
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

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // storage quota
      }
    }

    return data;
  } catch {
    const cached = getCachedCoinData();
    return cached;
  }
}

export async function fetchCoinChartPoints(
  timeframe: ChartTimeframe,
  basePrice: number,
): Promise<CoinChartPoint[]> {
  try {
    let endpoint = '';
    switch (timeframe) {
      case '1H':
        endpoint = `${GECKOTERMINAL_API_URL}/ohlcv/minute?aggregate=5&limit=12`;
        break;
      case '24H':
        endpoint = `${GECKOTERMINAL_API_URL}/ohlcv/hour?limit=24`;
        break;
      case '7D':
        endpoint = `${GECKOTERMINAL_API_URL}/ohlcv/hour?aggregate=4&limit=42`;
        break;
      case '30D':
        endpoint = `${GECKOTERMINAL_API_URL}/ohlcv/day?limit=30`;
        break;
      case 'ALL':
        endpoint = `${GECKOTERMINAL_API_URL}/ohlcv/day?limit=90`;
        break;
    }

    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`OHLCV API error ${res.status}`);
    }

    const json = await res.json();
    const ohlcvList: number[][] = json?.data?.attributes?.ohlcv_list;

    if (!Array.isArray(ohlcvList) || ohlcvList.length === 0) {
      throw new Error('Empty OHLCV data');
    }

    // GeckoTerminal returns newest first [timestamp, open, high, low, close, volume], so reverse to chronological
    const sorted = [...ohlcvList].reverse();

    return sorted.map(([sec, _open, _high, _low, close]) => {
      const timeMs = sec * 1000;
      const date = new Date(timeMs);
      const timeLabel =
        timeframe === '1H' || timeframe === '24H'
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        timestamp: timeMs,
        timeLabel,
        price: close,
        formattedPrice: formatCoinPrice(close),
      };
    });
  } catch {
    return generateSyntheticChart(timeframe, basePrice);
  }
}

export function useCoinLivePrice() {
  return useQuery({
    queryKey: ['coin-live-market-price'],
    queryFn: fetchCoinMarketData,
    initialData: getCachedCoinData,
    refetchInterval: 30000, // Refresh every 30s
    staleTime: 15000,
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
