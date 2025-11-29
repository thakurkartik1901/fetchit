import React from 'react';

import { Button, Text, View } from '@/components/ui';

interface EmptyOrdersViewProps {
  onRefresh: () => void;
}

export function EmptyOrdersView({ onRefresh }: EmptyOrdersViewProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="mb-4 size-20 items-center justify-center rounded-full bg-neutral-100">
        <Text className="text-3xl">📦</Text>
      </View>
      <Text className="mb-2 text-center font-inter-bold text-xl">
        No Orders Found
      </Text>
      <Text className="mb-6 text-center text-neutral-600">
        We couldn&apos;t find any orders in your recent emails. Try refreshing
        or check back later.
      </Text>
      <Button label="Refresh" variant="outline" onPress={onRefresh} />
    </View>
  );
}
