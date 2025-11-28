import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Text } from '../core/text';

type PriceProps = {
  value: number;
  strikethrough?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Price({
  value,
  strikethrough,
  size = 'md',
  className,
}: PriceProps) {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

  const formattedStrikethrough = strikethrough
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(strikethrough)
    : null;

  return (
    <View className={twMerge('flex-row items-center gap-2', className)}>
      <Text
        className={
          size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base'
        }
      >
        {formattedPrice}
      </Text>

      {formattedStrikethrough && (
        <Text className="text-text-subtitle text-base line-through">
          {formattedStrikethrough}
        </Text>
      )}
    </View>
  );
}
