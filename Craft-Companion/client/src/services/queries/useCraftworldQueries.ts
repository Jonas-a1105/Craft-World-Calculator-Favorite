import { useQuery } from '@tanstack/react-query';
import { getCraftworldHome, getMe } from '../api';
import { loadFactoryData, type FactoryDataRow } from '../factoryData';
import { refreshGameConfig } from '../gameConfig';
import type { CraftworldHomePayload, Me } from '../../types';

export const CRAFTWORLD_QUERY_KEYS = {
  home: ['craftworld', 'home'] as const,
  factoryData: ['craftworld', 'factoryData'] as const,
  me: ['auth', 'me'] as const,
};

export type QueryErrorKind = 'auth' | 'network' | 'server' | 'unknown';

/**
 * Clasifica el error del wrapper fetch (`api.ts` lanza Error con el mensaje
 * del servidor). Sin esta distinción la UI no puede diferenciar
 * "sesión caducada" (revincular) de "servidor caído" (reintentar).
 */
export function classifyQueryError(err: unknown): QueryErrorKind {
  const msg = err instanceof Error ? err.message.toLowerCase() : '';
  if (!msg) return 'unknown';
  if (
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('unauthorized') ||
    msg.includes('forbidden') ||
    msg.includes('no autorizado') ||
    msg.includes('sesión') ||
    msg.includes('token')
  ) {
    return 'auth';
  }
  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
    return 'server';
  }
  if (
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('fetch') ||
    msg.includes('cors') ||
    msg.includes('timeout') ||
    msg.includes('abort')
  ) {
    return 'network';
  }
  return 'unknown';
}

/**
 * Global shared query for CraftWorld Home state.
 * Deduplicates requests across all modules (Home, Empire, Inventory, Advisor, Navbar, etc.)
 * Provides instantaneous 0ms tab switching with background stale-while-revalidate.
 *
 * IMPORTANT (QW3): el error NO se traga. Los módulos pueden leer `error`/`isError`
 * del mismo hook para mostrar un estado accionable en lugar de renderizar
 * silenciosamente datos de respaldo.
 */
export function useCraftworldHomeQuery() {
  return useQuery<CraftworldHomePayload | null>({
    queryKey: CRAFTWORLD_QUERY_KEYS.home,
    queryFn: async () => {
      const home = await getCraftworldHome();
      // Sesión activa confirmada: refresca la config estática si el checksum
      // del juego cambió (no bloquea; los fallos los gestiona el servicio).
      void refreshGameConfig();
      return home;
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000, // Background refresh every 30s
    retry: (failureCount, error) => {
      // Sin reintentos en errores de sesión: reintentar no los resuelve.
      if (classifyQueryError(error) === 'auth') return false;
      return failureCount < 2;
    },
  });
}

/**
 * Global shared query for factory static configuration progression dataset.
 */
export function useFactoryDataQuery() {
  return useQuery<FactoryDataRow[]>({
    queryKey: CRAFTWORLD_QUERY_KEYS.factoryData,
    queryFn: async () => {
      return await loadFactoryData();
    },
    staleTime: 15 * 60 * 1000, // Factory definitions are static for 15 minutes
  });
}

/**
 * Global query for authenticated user session.
 */
export function useMeQuery() {
  return useQuery<Me | null>({
    queryKey: CRAFTWORLD_QUERY_KEYS.me,
    queryFn: async () => {
      return (await getMe()) as Me | null;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (classifyQueryError(error) === 'auth') return false;
      return failureCount < 2;
    },
  });
}
