// Dominio: fusión de fuentes de precios del cliente.
// Función pura de negocio: mezcla defaults del juego + pools DEX (Katana V3)
// + priceList del servidor, aplicando la política de frescura.
// Sin HTTP directo ni persistencia (lee solo el snapshot de pools ya cargado en memoria).
import type { CraftworldHomePayload, CraftworldPriceItem } from '../types';
import {
  getCachedRoninPools,
  getLatestPoolPrice,
  isPoolLiquid,
  type RoninPoolsDataset,
} from './roninPoolsService';
import { DEFAULT_MARKET_PRICES } from './defaultMarketPrices';
import { PRICE_LIST_STALE_MS } from './priceFreshness';

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
      if (!isPoolLiquid(item)) continue; // dust pools: price is noise, not market
      const latest = getLatestPoolPrice(item);
      if (latest > 0) {
        map[sym.toUpperCase()] = latest;
      }
    }
  }

  // 2. Fusionar cotizaciones desde el servidor del juego (FUENTE PRIMARIA - datos reales del juego)
  // Si hay datos del juego disponibles Y son frescos (< 2 horas), se usan. Si son viejos, se usa DEFAULT_MARKET_PRICES actualizado.
  if (home?.priceList?.prices && Array.isArray(home.priceList.prices) && home?.priceList?.lastSyncedAt) {
    const priceAgeMs = Date.now() - new Date(home.priceList.lastSyncedAt).getTime();
    if (priceAgeMs <= PRICE_LIST_STALE_MS) {
      // Datos del juego frescos: usar precios del juego
      home.priceList.prices.forEach((p: CraftworldPriceItem) => {
        if (typeof p.amount === 'number' && p.amount > 0 && p.referenceSymbol) {
          map[p.referenceSymbol.toUpperCase()] = p.amount;
        }
      });
    } else {
      // Datos del juego viejos (>2 horas): usar DEFAULT_MARKET_PRICES actualizado para evitar precios desactualizados
      console.warn('[priceAggregator] Datos del juego viejos (', Math.round(priceAgeMs / 60000), 'min). Usando precios actualizados del archivo.');
    }
  }

  return map;
}
