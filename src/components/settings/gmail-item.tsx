import React from 'react';

import { Button, Text, View } from '@/components/ui';
import { useGmail } from '@/lib/gmail';
import { useGoogleAuth } from '@/lib/gmail/use-google-auth';
import { toast } from '@/lib/toast';

export function GmailItem() {
  const isGmailLinked = useGmail.use.isGmailLinked();
  const unlinkGmail = useGmail.use.unlinkGmail();

  const { promptAsync, isLoading } = useGoogleAuth();

  function handlePress(): void {
    if (isLoading) return;

    if (isGmailLinked) {
      unlinkGmail();
      toast.success('Gmail account unlinked successfully!');
    } else {
      // Triggers OAuth flow - deep link callback is handled in _layout.tsx
      promptAsync();
    }
  }

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-1">
        <Text className="font-inter-medium text-base">Gmail Account</Text>
        <Text className="mt-1 text-sm text-neutral-600">
          {isGmailLinked
            ? 'Connected - Track orders from your emails'
            : 'Connect to sync your purchase emails'}
        </Text>
      </View>
      <Button
        onPress={handlePress}
        disabled={isLoading}
        label={
          isLoading
            ? 'Connecting...'
            : isGmailLinked
              ? 'Unlink'
              : 'Link Account'
        }
        variant={isGmailLinked ? 'outline' : 'secondary'}
        size="sm"
      />
    </View>
  );
}
