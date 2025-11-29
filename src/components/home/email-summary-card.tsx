import React from 'react';

import { Text, View } from '@/components/ui';

interface EmailSummaryCardProps {
  totalEmails: number;
  ordersCount: number;
}

export function EmailSummaryCard({
  totalEmails,
  ordersCount,
}: EmailSummaryCardProps) {
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
