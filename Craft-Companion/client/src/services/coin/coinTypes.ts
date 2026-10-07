export interface CoinMarketData {
  priceUsd: number;
  quotePriceUsd: number;
  priceInRon: number;
  ronInCoin: number;
  h1Change: number;
  h24Change: number;
  volume24h: number;
  reserveUsd: number;
  fdvUsd: number;
  buys24h: number;
  sells24h: number;
  poolAddress: string;
  poolName: string;
  updatedAt: string;
  source: 'live' | 'cache' | 'default';
}

export type EcosystemCurrency = 'COIN' | 'USD' | 'USDC' | 'RON';

export interface CurrencyOption {
  id: EcosystemCurrency;
  name: string;
  symbol: string;
  description: string;
}

export const ECOSYSTEM_CURRENCIES: CurrencyOption[] = [
  { id: 'COIN', name: 'Dyno Coin', symbol: 'COIN', description: 'Moneda principal de Craft World' },
  { id: 'USD', name: 'US Dollar', symbol: 'USD', description: 'Dólar estadounidense (Fiat)' },
  { id: 'USDC', name: 'USD Coin', symbol: 'USDC', description: 'Dólar digital en Ronin' },
  { id: 'RON', name: 'Ronin', symbol: 'RON', description: 'Token de red Ronin (Katana)' },
];

export interface CoinChartPoint {
  timestamp: number;
  timeLabel: string;
  price: number;
  formattedPrice: string;
}

export type ChartTimeframe = '1H' | '24H' | '7D' | '30D' | 'ALL';

export const GECKOTERMINAL_RONIN_COIN_POOL = '0xda021b3d91f82bf2bcfc1a8709545c3a643d47de';
export const GECKOTERMINAL_POOL_URL = `https://www.geckoterminal.com/ronin/pools/${GECKOTERMINAL_RONIN_COIN_POOL}`;
export const GECKOTERMINAL_API_URL = `https://api.geckoterminal.com/api/v2/networks/ronin/pools/${GECKOTERMINAL_RONIN_COIN_POOL}`;

export const LOCAL_STORAGE_KEY = 'craftworld.coin_price_data';

export const DEFAULT_COIN_DATA: CoinMarketData = {
  priceUsd: 0.0002105,
  quotePriceUsd: 0.06325,
  priceInRon: 0.0033895,
  ronInCoin: 295.027,
  h1Change: 0.04,
  h24Change: -3.38,
  volume24h: 467.52,
  reserveUsd: 6094.78,
  fdvUsd: 236474,
  buys24h: 143,
  sells24h: 94,
  poolAddress: GECKOTERMINAL_RONIN_COIN_POOL,
  poolName: 'COIN / WRON 1%',
  updatedAt: new Date().toISOString(),
  source: 'default',
};
