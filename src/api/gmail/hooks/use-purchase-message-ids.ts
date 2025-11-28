import { useInfiniteQuery } from '@tanstack/react-query';

import type { GmailListResponse } from '../types';
import { buildPurchasesQuery, listMessages } from '../client';

/**
 * Hook to fetch purchase email IDs with pagination
 */
export function usePurchaseMessageIds(accessToken: string | null) {
  return useInfiniteQuery<GmailListResponse>({
    enabled: Boolean(accessToken),
    queryKey: ['gmail', 'purchases', 'ids'],
    queryFn: async ({ pageParam }) =>
      listMessages({
        accessToken: accessToken as string,
        q: buildPurchasesQuery(),
        pageToken: pageParam as string | undefined,
      }),
    initialPageParam: undefined as unknown as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
  });
}
