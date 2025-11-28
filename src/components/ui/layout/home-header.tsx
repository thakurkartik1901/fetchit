import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Text } from '@/components/ui/core/text';
import { ArrowLeft } from '@/components/ui/icons';
import { haptics } from '@/lib/haptics';

import { colors } from '../tokens';

type HomeHeaderProps = {
  title?: string | null;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
};

export function HomeHeader({
  title = null,
  showBack = false,
  onBackPress,
  rightElement,
  className,
}: HomeHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    haptics.light();
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={twMerge(
        'flex-row items-center px-4 pb-3 pt-8 border-b border-neutral-200',
        className
      )}
      // style={SHADOWS.appHeader}
    >
      {showBack && (
        <Pressable onPress={handleBack} className="-ml-2 mr-3 p-2">
          <ArrowLeft size={20} color={colors.primary[400]} />
        </Pressable>
      )}

      {title && (
        <Text className="flex-1 font-inter-bold text-base">{title}</Text>
      )}

      {rightElement}
    </View>
  );
}
