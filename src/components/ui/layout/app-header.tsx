import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Text } from '@/components/ui/core/text';
import { ArrowLeft } from '@/components/ui/icons';
import { haptics } from '@/lib/haptics';

import { colors } from '../tokens';

type AppHeaderProps = {
  title?: string | null;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
};

export function AppHeader({
  title = null,
  showBack = false,
  onBackPress,
  rightElement,
  className,
}: AppHeaderProps) {
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
        'flex-row items-center px-4 pb-3 pt-6 border-b border-neutral-200',
        className
      )}
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
