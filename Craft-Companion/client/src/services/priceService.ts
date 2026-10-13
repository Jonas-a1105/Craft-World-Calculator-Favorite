// Fachada pública de precios del cliente.
// Cada responsabilidad vive en su propio módulo (razón de cambio única):
//  - defaultMarketPrices.ts : datos estáticos de balance del juego
//  - roninDexClient.ts      : infraestructura (caché DEX Katana V3)
//  - priceAggregator.ts      : dominio (fusión pura de fuentes de precios)
//  - priceFreshness.ts       : dominio (política de staleness del priceList)
// Se mantienen los re-exports para no romper los consumidores existentes.
export { DEFAULT_MARKET_PRICES, FALLBACK_RESOURCE_PRICE } from './defaultMarketPrices';
export {
  fetchLiveTokenPrice,
  fetchLiveTokenPrices,
  type LivePriceResult,
} from './roninDexClient';
export { extractPriceMap } from './priceAggregator';
export { PRICE_LIST_STALE_MS, getPriceListInfo } from './priceFreshness';
