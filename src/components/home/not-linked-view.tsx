import React from 'react';

import { Button, Text, View } from '@/components/ui';
import { useGmail } from '@/lib/gmail';
import { useGoogleAuth } from '@/lib/gmail/use-google-auth';

export function NotLinkedView() {
  const { promptAsync, isLoading } = useGoogleAuth();
  const isGmailLinked = useGmail.use.isGmailLinked();

  // If somehow Gmail is linked, don't show this view
  if (isGmailLinked) return null;

  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="mb-6 size-24 items-center justify-center rounded-full bg-primary-50">
        <Text className="text-4xl">📧</Text>
      </View>
      <Text className="mb-4 text-center font-inter-bold text-2xl">
        Welcome to FetchIt!
      </Text>
      <Text className="mb-8 text-center leading-relaxed text-neutral-600">
        Link your Gmail account to automatically track orders from your emails.
        We&apos;ll scan your purchase emails and show all your orders in one
        place.
      </Text>
      <Button
        label={isLoading ? 'Connecting...' : 'Link Gmail Account'}
        variant="secondary"
        onPress={promptAsync}
        disabled={isLoading}
        className="w-full"
      />
    </View>
  );
}
