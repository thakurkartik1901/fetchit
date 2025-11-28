import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { usePost } from '@/api';
import {
  ActivityIndicator,
  AppHeader,
  FocusAwareStatusBar,
  Screen,
  Text,
  View,
} from '@/components/ui';

export default function Post() {
  const local = useLocalSearchParams<{ id: string }>();

  const { data, isPending, isError } = usePost(Number(local.id));

  if (isPending) {
    return (
      <Screen safeArea={false} header={<AppHeader title="Post" showBack />}>
        <View className="flex-1 justify-center  p-3">
          <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
          <FocusAwareStatusBar />
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }
  if (isError) {
    return (
      <Screen safeArea={false} header={<AppHeader title="Post" showBack />}>
        <View className="flex-1 justify-center p-3">
          <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
          <FocusAwareStatusBar />
          <Text className="text-center">Error loading post</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea={false} header={<AppHeader title="Post" showBack />}>
      <View className="flex-1 p-3 ">
        <FocusAwareStatusBar />
        <Text className="text-xl">{data.title}</Text>
        <Text>{data.body} </Text>
      </View>
    </Screen>
  );
}
