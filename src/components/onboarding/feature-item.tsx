import * as React from 'react';

import { Text, View } from '@/components/ui';

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function FeatureItem({ icon, title, description }: Props) {
  return (
    <View className="flex-row items-start gap-4">
      <View className="size-12 items-center justify-center rounded-2xl bg-primary-50">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="font-inter-semibold text-base text-charcoal-900">
          {title}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-neutral-500">
          {description}
        </Text>
      </View>
    </View>
  );
}
