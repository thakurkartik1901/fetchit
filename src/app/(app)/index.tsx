import React from 'react';

import {
  EmailSummaryCard,
  EmptyOrdersView,
  LoadingView,
  NotLinkedView,
  OrdersList,
} from '@/components/home';
import { useFetchOrders } from '@/components/home/hooks/use-fetch-orders';
import { Button, View } from '@/components/ui';
import { HomeHeader, Screen } from '@/components/ui/layout';
import { useGmail } from '@/lib/gmail';

export default function Home() {
  const isGmailLinked = useGmail.use.isGmailLinked();
  const gmailToken = useGmail.use.gmailToken();

  const {
    orders,
    isLoadingOrders,
    totalEmails,
    fetchAndParseOrders,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useFetchOrders(gmailToken?.accessToken || null);

  // Not linked state - show link button on home page
  if (!isGmailLinked) {
    return (
      <Screen safeArea={false} header={<HomeHeader title="Home" />}>
        <NotLinkedView />
      </Screen>
    );
  }

  // Linked state - show orders
  return (
    <Screen safeArea={false} header={<HomeHeader title="Home" />}>
      <View className="flex-1 p-4">
        <EmailSummaryCard
          totalEmails={totalEmails}
          ordersCount={orders.length}
        />

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
