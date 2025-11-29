import React from 'react';

import type { ParsedOrder } from '@/api/gmail';
import { Button, Text, View } from '@/components/ui';

import { OrderCard } from './order-card';

interface OrdersListProps {
  orders: ParsedOrder[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function OrdersList({
  orders,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: OrdersListProps) {
  return (
    <View className="flex-1">
      <Text className="mb-3 font-inter-bold text-lg dark:text-white">
        Recent Orders ({orders.length})
      </Text>
      {orders.map((item) => (
        <OrderCard key={item.id} order={item} />
      ))}

      {hasNextPage && onLoadMore && (
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
