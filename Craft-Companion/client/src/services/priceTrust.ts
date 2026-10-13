// Dominio: estado de confianza de los datos de precios en toda la app.
// Razón de cambio única: cómo el usuario puede fiarse de las cifras que vea.
// Combina tres fuentes: el estado reportado por el servidor (`priceListStatus`),
// la frescura del `lastSyncedAt` del propio juego (priceFreshness.ts) y los
// errores tipificados de la query compartida (QW3).
import {
  classifyQueryError,
  useCraftworldHomeQuery,
} from './queries/useCraftworldQueries';
import { getPriceListInfo } from './priceFreshness';

export type PriceTrustKind =
  | 'live' // datos del juego recién sincronizados
  | 'cache' // precios válidos pero servidos desde caché del servidor
  | 'stale' // priceList del juego más viejo de 2h
  | 'missing' // no hay priceList disponible (sin sesión / sin datos)
  | 'auth-error' // sesión caducada o sin autorizar → acción: revincular
  | 'network-error' // fallo de red compartido → acción: reintentar
  | 'server-error' // error 5xx del servidor → acción: reintentar
  | 'unknown-error';

export interface PriceTrust {
  kind: PriceTrustKind;
  syncedAt: string | null;
  isStale: boolean;
  /** true cuando no hace falta mostrar ningún aviso al usuario. */
  isClean: boolean;
}

/**
 * Hook global de confianza de precios. Consúmelo cualquier módulo que tome
 * decisiones sobre precios del juego (Prices, Profitability, TradingBot,
 * BaseCost…) para mostrar el mismo estado al usuario.
 */
export function usePriceTrust(): PriceTrust {
  const { data: home, error } = useCraftworldHomeQuery();

  if (error) {
    const errorKind = classifyQueryError(error);
    const kind: PriceTrustKind =
      errorKind === 'auth'
        ? 'auth-error'
        : errorKind === 'server'
          ? 'server-error'
          : errorKind === 'network'
            ? 'network-error'
            : 'unknown-error';
    return { kind, syncedAt: null, isStale: true, isClean: false };
  }

  if (!home) {
    return { kind: 'missing', syncedAt: null, isStale: true, isClean: false };
  }

  const { syncedAt, isStale } = getPriceListInfo(home);

  // El servidor clasifica su propia fuente de precios; si no lo envía,
  // derivamos el estado de la presencia + frescura del priceList.
  const serverStatus = home.priceListStatus;
  if (serverStatus === 'missing') {
    return { kind: 'missing', syncedAt, isStale, isClean: false };
  }
  if (serverStatus === 'cache') {
    return { kind: 'cache', syncedAt, isStale, isClean: false };
  }
  if (isStale) {
    return { kind: 'stale', syncedAt, isStale, isClean: false };
  }
  return { kind: 'live', syncedAt, isStale: false, isClean: true };
}
