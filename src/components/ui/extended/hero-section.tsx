import { View } from '@/components/ui';

export function HeroSection({ icon }: { icon: React.ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center bg-primary-50">
      {/* Decorative circles */}
      <View className="absolute -right-16 top-8 size-56 rounded-full bg-primary-100/60" />
      <View className="absolute -left-12 bottom-4 size-40 rounded-full bg-primary-100/40" />
      <View className="absolute bottom-16 right-12 size-20 rounded-full bg-primary-200/50" />

      {/* Main icon */}
      <View className="size-32 items-center justify-center rounded-[40px] bg-primary-600 shadow-xl">
        {icon}
      </View>
    </View>
  );
}
