import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
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
