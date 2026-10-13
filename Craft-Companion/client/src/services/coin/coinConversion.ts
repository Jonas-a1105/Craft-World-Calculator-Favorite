import {
  DEFAULT_COIN_DATA,
  type CoinMarketData,
  type EcosystemCurrency,
} from './coinTypes';
import {
  coinToUsd,
  resolveCoinUsdPrice,
  toFiniteNumber,
  usdToCoin,
} from '../financial/pricingService';

export function convertEcosystemCurrency(
  amount: number,
  from: EcosystemCurrency,
  to: EcosystemCurrency,
  marketData?: CoinMarketData | null,
): number {
  const value = toFiniteNumber(amount, 0);
  if (value <= 0) return 0;
  if (from === to) return value;

  const data = marketData || DEFAULT_COIN_DATA;
  // Tasas efectivas con fallback canónico resuelto por el servicio financiero.
  const coinUsd = resolveCoinUsdPrice(data.priceUsd, DEFAULT_COIN_DATA.priceUsd);
  const ronUsd = resolveCoinUsdPrice(data.quotePriceUsd, DEFAULT_COIN_DATA.quotePriceUsd);

  // 1. Convert "from" to standard USD value
  let valueInUsd = 0;
  switch (from) {
    case 'COIN':
      valueInUsd = coinToUsd(value, coinUsd);
      break;
    case 'USD':
    case 'USDC':
      valueInUsd = value;
      break;
    case 'RON':
      valueInUsd = value * ronUsd;
      break;
  }

  // 2. Convert USD value into "to" currency
  switch (to) {
    case 'COIN':
      return usdToCoin(valueInUsd, coinUsd);
    case 'USD':
    case 'USDC':
      return valueInUsd;
    case 'RON':
      return ronUsd > 0 ? valueInUsd / ronUsd : 0;
  }
}
