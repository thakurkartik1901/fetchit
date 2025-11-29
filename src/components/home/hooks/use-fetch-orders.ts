import { useCallback, useEffect, useState } from 'react';

import {
  getMessage,
  type ParsedOrder,
  parseOrderFromMessage,
  usePurchaseMessageIds,
} from '@/api/gmail';

interface UseFetchOrdersResult {
  orders: ParsedOrder[];
  isLoadingOrders: boolean;
  totalEmails: number;
  fetchAndParseOrders: () => Promise<void>;
  data: any;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  refetch: () => void;
}

export function useFetchOrders(
  accessToken: string | null
): UseFetchOrdersResult {
  const [orders, setOrders] = useState<ParsedOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch purchase email IDs
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    usePurchaseMessageIds(accessToken);

  // Calculate total emails
  const totalEmails =
    data?.pages?.reduce(
      (sum: number, page: any) => sum + (page.messages?.length || 0),
      0
    ) || 0;

  // Fetch and parse full email details
  const fetchAndParseOrders = useCallback(async () => {
    if (!accessToken || !data?.pages) return;

    setIsLoadingOrders(true);
    try {
      // Get message IDs (limit to 25 for demo)
      const ids = data.pages
        .flatMap((page) => page.messages || [])
        .map((m) => m.id)
        .slice(0, 25);

      // Fetch full message details in parallel
      const messages = await Promise.all(
        ids.map((id) => getMessage({ accessToken, id }))
      );

      // Parse orders from messages
      const parsed = messages
        .map((m) => parseOrderFromMessage(m))
        .filter(Boolean) as ParsedOrder[];

      setOrders(parsed);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [accessToken, data?.pages]);

  // Auto-fetch on mount when access token is available
  useEffect(() => {
    if (accessToken && data?.pages && orders.length === 0) {
      fetchAndParseOrders();
    }
  }, [accessToken, data, orders.length, fetchAndParseOrders]);

  return {
    orders,
    isLoadingOrders,
    totalEmails,
    fetchAndParseOrders,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}
