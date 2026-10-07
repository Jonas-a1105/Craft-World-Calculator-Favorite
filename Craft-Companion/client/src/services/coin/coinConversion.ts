import {
  DEFAULT_COIN_DATA,
  type CoinMarketData,
  type EcosystemCurrency,
} from './coinTypes';

export function convertEcosystemCurrency(
  amount: number,
  from: EcosystemCurrency,
  to: EcosystemCurrency,
  marketData?: CoinMarketData | null,
): number {
  if (amount <= 0 || isNaN(amount)) return 0;
  if (from === to) return amount;

  const data = marketData || DEFAULT_COIN_DATA;
  const coinUsd = data.priceUsd > 0 ? data.priceUsd : DEFAULT_COIN_DATA.priceUsd;
  const ronUsd = data.quotePriceUsd > 0 ? data.quotePriceUsd : DEFAULT_COIN_DATA.quotePriceUsd;

  // 1. Convert "from" to standard USD value
  let valueInUsd = 0;
  switch (from) {
    case 'COIN':
      valueInUsd = amount * coinUsd;
      break;
    case 'USD':
    case 'USDC':
      valueInUsd = amount;
      break;
    case 'RON':
      valueInUsd = amount * ronUsd;
      break;
  }

  // 2. Convert USD value into "to" currency
  switch (to) {
    case 'COIN':
      return coinUsd > 0 ? valueInUsd / coinUsd : 0;
    case 'USD':
    case 'USDC':
      return valueInUsd;
    case 'RON':
      return ronUsd > 0 ? valueInUsd / ronUsd : 0;
  }
}
