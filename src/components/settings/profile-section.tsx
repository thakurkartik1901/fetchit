import * as React from 'react';

import { colors, Pressable, Text, View } from '@/components/ui';
import { Avatar, Pencil } from '@/components/ui/icons';

type Props = {
  name: string;
  username: string;
  onEditPress?: () => void;
};

export function ProfileSection({ name, username, onEditPress }: Props) {
  return (
    <View className="items-center pb-8 pt-4">
      {/* Avatar with Edit Button */}
      <View className="relative mb-3">
        <Avatar width={100} height={100} />
        <Pressable
          onPress={onEditPress}
          className="absolute -bottom-1 -right-1 size-9 items-center justify-center rounded-full bg-primary-600"
          style={{
            shadowColor: colors.primary[600],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Pencil color={colors.white} />
        </Pressable>
      </View>

      {/* Name and Username */}
      <Text className="font-inter-semibold text-xl text-charcoal-900 dark:text-white">
        {name}
      </Text>
      <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        @{username}
      </Text>
    </View>
  );
}
