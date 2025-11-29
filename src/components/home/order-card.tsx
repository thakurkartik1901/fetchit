import React from 'react';

import type { ParsedOrder } from '@/api/gmail';
import { Text, View } from '@/components/ui';

interface OrderCardProps {
  order: ParsedOrder;
}

export function OrderCard({ order }: OrderCardProps) {
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
    <View className="mb-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-charcoal-700 dark:bg-charcoal-800">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-inter-bold text-lg dark:text-white">
          {order.vendor}
        </Text>
        <View className={`rounded-full px-3 py-1 ${colors.bg}`}>
          <Text className={`font-inter-medium text-xs ${colors.text}`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      {order.totalAmount && (
        <Text className="mb-1 text-neutral-700 dark:text-neutral-300">
          Amount: <Text className="font-inter-bold">{order.totalAmount}</Text>
        </Text>
      )}
      {order.orderId && (
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          Order ID: {order.orderId}
        </Text>
      )}
    </View>
  );
}
