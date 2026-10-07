import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { notifyError } from '../utils/sileoNotifications';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Prevent toasts on expected 401 unauthenticated checks on landing/signin
      const key = query.queryKey[0];
      const isAuthQuery = key === 'me' || key === 'home';
      const isPublicPath =
        typeof window !== 'undefined' &&
        (window.location.pathname === '/' || window.location.pathname === '/signin');
      if (isAuthQuery && isPublicPath) return;

      notifyError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      notifyError(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Data remains fresh for 60s (0ms instant tab transitions)
      gcTime: 10 * 60 * 1000, // Unused cache kept for 10 minutes
      refetchOnWindowFocus: true, // Auto-syncs when switching back from Craft World
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

