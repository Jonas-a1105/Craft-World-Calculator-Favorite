import { useQuery } from '@tanstack/react-query';
import { getCraftworldHome, getMe } from '../api';
import { loadFactoryData, type FactoryDataRow } from '../factoryData';

export const CRAFTWORLD_QUERY_KEYS = {
  home: ['craftworld', 'home'] as const,
  factoryData: ['craftworld', 'factoryData'] as const,
  me: ['auth', 'me'] as const,
};

/**
 * Global shared query for CraftWorld Home state.
 * Deduplicates requests across all modules (Home, Empire, Inventory, Advisor, Navbar, etc.)
 * Provides instantaneous 0ms tab switching with background stale-while-revalidate.
 */
export function useCraftworldHomeQuery() {
  return useQuery({
    queryKey: CRAFTWORLD_QUERY_KEYS.home,
    queryFn: async () => {
      try {
        return await getCraftworldHome();
      } catch (err) {
        console.warn('[TanStack Query] Failed fetching CraftWorld home:', err);
        return null;
      }
    },
    staleTime: 60 * 1000,
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
  return useQuery({
    queryKey: CRAFTWORLD_QUERY_KEYS.me,
    queryFn: async () => {
      try {
        return await getMe();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
