import React from 'react';
import { ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/ui';
import colors from '@/components/ui/tokens/colors';

export function LoadingView() {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text className="mt-4 text-neutral-600">Loading your orders...</Text>
    </View>
  );
}
