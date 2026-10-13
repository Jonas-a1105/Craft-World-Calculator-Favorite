// Dominio: política de frescura del priceList del juego.
// Razón de cambio única: reglas de negocio sobre la edad de los datos.
import type { CraftworldHomePayload } from '../types';

/** Un priceList del juego más antiguo que esto se considera stale (sus precios pueden diferir del juego en vivo). */
export const PRICE_LIST_STALE_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Frescura del priceList según el lastSyncedAt del propio juego
 * (NO el tiempo de consulta del cliente — una respuesta cacheada del servidor
 * puede verse "fresca" en el cliente mientras trae precios de días atrás).
 */
export function getPriceListInfo(
  home?: CraftworldHomePayload | null,
): { syncedAt: string | null; isStale: boolean } {
  const syncedAt = home?.priceList?.lastSyncedAt ?? null;
  if (!syncedAt) return { syncedAt: null, isStale: true };
  const age = Date.now() - new Date(syncedAt).getTime();
  return { syncedAt, isStale: !Number.isFinite(age) || age > PRICE_LIST_STALE_MS };
}
