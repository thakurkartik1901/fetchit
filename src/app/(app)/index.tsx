/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import {
  getMessage,
  type ParsedOrder,
  parseOrderFromMessage,
  usePurchaseMessageIds,
} from '@/api/gmail';
import { Button, Text, View } from '@/components/ui';
import { HomeHeader, Screen } from '@/components/ui/layout';
import colors from '@/components/ui/tokens/colors';
import { useGmail } from '@/lib/gmail';

export default function Home() {
  const router = useRouter();
  const isGmailLinked = useGmail.use.isGmailLinked();
  const gmailToken = useGmail.use.gmailToken();
  const [orders, setOrders] = useState<ParsedOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch purchase email IDs
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    usePurchaseMessageIds(gmailToken?.accessToken || null);

  // Fetch and parse full email details
  const fetchAndParseOrders = useCallback(async () => {
    if (!gmailToken?.accessToken || !data?.pages) return;

    setIsLoadingOrders(true);
    try {
      // Get message IDs
      const ids = data.pages
        .flatMap((page) => page.messages || [])
        .map((m) => m.id)
        .slice(0, 25); // Limit for demo

      // Fetch full message details
      const messages = await Promise.all(
        ids.map((id) => getMessage({ accessToken: gmailToken.accessToken, id }))
      );

      // Parse orders from messages
      const parsed = messages
        .map((m) => parseOrderFromMessage(m))
        .filter(Boolean) as ParsedOrder[];

      setOrders(parsed);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [gmailToken?.accessToken, data?.pages]);

  // Auto-fetch on mount
  useEffect(() => {
    if (gmailToken?.accessToken && data?.pages && orders.length === 0) {
      fetchAndParseOrders();
    }
  }, [gmailToken?.accessToken, data, orders.length, fetchAndParseOrders]);

  // Not linked state
  if (!isGmailLinked) {
    return (
      <Screen safeArea={false} header={<HomeHeader title="Home" />}>
        <NotLinkedView onGoToSettings={() => router.push('/settings')} />
      </Screen>
    );
  }

  // Linked state
  return (
    <Screen safeArea={false} header={<HomeHeader title="Home" />}>
      <View className="flex-1 p-4">
        <EmailSummaryCard data={data} ordersCount={orders.length} />

        <Button
          label={isLoadingOrders ? 'Loading Orders...' : 'Refresh Orders'}
          onPress={fetchAndParseOrders}
          disabled={isLoadingOrders}
          variant="secondary"
          className="mb-4"
        />

        {isLoadingOrders && <LoadingView />}

        {!isLoadingOrders && orders.length > 0 && (
          <OrdersList
            orders={orders}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        )}

        {!isLoadingOrders && orders.length === 0 && (
          <EmptyOrdersView onRefresh={() => refetch()} />
        )}
      </View>
    </Screen>
  );
}

// Subcomponents

function NotLinkedView({ onGoToSettings }: { onGoToSettings: () => void }) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="mb-6 size-24 items-center justify-center rounded-full bg-primary-50">
        <Text className="text-4xl">📧</Text>
      </View>
      <Text className="mb-4 text-center font-inter-bold text-2xl">
        Welcome to FetchIt!
      </Text>
      <Text className="mb-8 text-center text-neutral-600">
        Link your Gmail account to automatically track orders from your emails
      </Text>
      <Button
        label="Go to Settings"
        variant="secondary"
        onPress={onGoToSettings}
      />
    </View>
  );
}

function EmailSummaryCard({
  data,
  ordersCount,
}: {
  data: any;
  ordersCount: number;
}) {
  const totalEmails =
    data?.pages?.reduce(
      (sum: number, p: any) => sum + (p.messages?.length || 0),
      0
    ) || 0;

  return (
    <View className="mb-4 rounded-xl bg-primary-50 p-4">
      <Text className="mb-2 font-inter-bold text-primary-900">
        Email Summary
      </Text>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-neutral-600">Total Emails</Text>
          <Text className="font-inter-bold text-2xl text-primary-600">
            {totalEmails}
          </Text>
        </View>
        <View>
          <Text className="text-sm text-neutral-600">Parsed Orders</Text>
          <Text className="font-inter-bold text-2xl text-success-600">
            {ordersCount}
          </Text>
        </View>
      </View>
    </View>
  );
}

function LoadingView() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text className="mt-4 text-neutral-600">Loading your orders...</Text>
    </View>
  );
}

function OrdersList({
  orders,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  orders: ParsedOrder[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-3 font-inter-bold text-lg">
        Recent Orders ({orders.length})
      </Text>
      {orders.map((item) => (
        <OrderCard key={item.id} order={item} />
      ))}

      {hasNextPage && (
        <Button
          label={isFetchingNextPage ? 'Loading...' : 'Load More Emails'}
          onPress={onLoadMore}
          disabled={isFetchingNextPage}
          variant="outline"
          className="mt-2"
        />
      )}
    </View>
  );
}

function OrderCard({ order }: { order: ParsedOrder }) {
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'delivered':
        return { bg: 'bg-success-100', text: 'text-success-700' };
      case 'shipped':
        return { bg: 'bg-primary-100', text: 'text-primary-700' };
      case 'cancelled':
        return { bg: 'bg-danger-100', text: 'text-danger-700' };
      default:
        return { bg: 'bg-neutral-100', text: 'text-neutral-700' };
    }
  };

  const colors = getStatusColors(order.status);

  return (
    <View className="mb-3 rounded-xl border border-neutral-200 bg-white p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-inter-bold text-lg">{order.vendor}</Text>
        <View className={`rounded-full px-3 py-1 ${colors.bg}`}>
          <Text className={`font-inter-medium text-xs ${colors.text}`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      {order.totalAmount && (
        <Text className="mb-1 text-neutral-700">
          Amount: <Text className="font-inter-bold">{order.totalAmount}</Text>
        </Text>
      )}
      {order.orderId && (
        <Text className="text-sm text-neutral-600">
          Order ID: {order.orderId}
        </Text>
      )}
    </View>
  );
}

function EmptyOrdersView({ onRefresh }: { onRefresh: () => void }) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="mb-4 size-20 items-center justify-center rounded-full bg-neutral-100">
        <Text className="text-3xl">📦</Text>
      </View>
      <Text className="mb-2 text-center font-inter-bold text-xl">
        No Orders Found
      </Text>
      <Text className="mb-6 text-center text-neutral-600">
        We couldn&apos;t find any orders in your recent emails
      </Text>
      <Button label="Refresh" variant="outline" onPress={onRefresh} />
    </View>
  );
}
