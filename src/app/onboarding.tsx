import { useRouter } from 'expo-router';
import React from 'react';

import { FeatureItem } from '@/components/onboarding/feature-item';
import { Button, SafeAreaView, Text, View } from '@/components/ui';
import { HeroSection } from '@/components/ui/extended';
import { Mail, MapPin, Package } from '@/components/ui/icons';
import { useIsFirstTime } from '@/lib/hooks';

function ContentSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <View className="bg-white px-6 pb-4 pt-8">
      {/* Title */}
      <Text className="text-center font-inter-bold text-3xl text-charcoal-900">
        Fetch It
      </Text>
      <Text className="mt-2 text-center text-base text-neutral-500">
        Track all your orders in one place
      </Text>

      {/* Features */}
      <View className="mt-8 gap-5">
        <FeatureItem
          icon={<Mail color="#006FFD" width={24} height={24} />}
          title="Gmail Sync"
          description="Automatically fetch orders from your email"
        />
        <FeatureItem
          icon={<Package color="#006FFD" width={24} height={24} />}
          title="Order Tracking"
          description="View all your purchases and delivery status"
        />
        <FeatureItem
          icon={<MapPin color="#006FFD" width={24} height={24} />}
          title="Live Updates"
          description="Get real-time tracking for your packages"
        />
      </View>

      {/* CTA Button */}
      <SafeAreaView edges={['bottom']} className="mt-8">
        <Button
          label="Get Started"
          variant="secondary"
          size="lg"
          onPress={onGetStarted}
        />
      </SafeAreaView>
    </View>
  );
}

export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  const handleGetStarted = () => {
    setIsFirstTime(false);
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-white">
      <HeroSection icon={<Package color="#FFFFFF" width={64} height={64} />} />
      <ContentSection onGetStarted={handleGetStarted} />
    </View>
  );
}
