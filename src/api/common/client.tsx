import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { toast } from '@/lib/toast';

/**
 * React Query Client Configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 20, // 20 minutes - data considered fresh
      gcTime: 1000 * 60 * 60, // 60 minutes - cache garbage collection time
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus (mobile)
      refetchOnReconnect: true, // Refetch when network reconnects
    },
    mutations: {
      retry: 0, // Don't retry mutations (create, update, delete)
    },
  },

  // Global error handler for queries
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('[React Query] Query Error:', {
        queryKey: query.queryKey,
        error,
      });
      toast.fromHttpError(error);
    },
  }),

  // Global error handler for mutations
  mutationCache: new MutationCache({
    // eslint-disable-next-line max-params
    onError: (error, _variables, _context, mutation) => {
      console.error('[React Query] Mutation Error:', {
        mutationKey: mutation.options.mutationKey,
        error,
      });
      toast.fromHttpError(error);
    },
  }),
});
