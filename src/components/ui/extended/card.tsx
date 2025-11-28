import { View, type ViewProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { SHADOWS } from '@/lib/shadows';

type CardProps = ViewProps & {
  className?: string;
  shadow?: 'none' | 'soft' | 'default';
  children: React.ReactNode;
};

export function Card({
  className,
  shadow = 'default',
  style,
  children,
  ...props
}: CardProps) {
  const shadowStyle =
    shadow === 'default'
      ? SHADOWS.card
      : shadow === 'soft'
        ? SHADOWS.cardSoft
        : {};

  return (
    <View
      {...props}
      className={twMerge(
        'bg-surface rounded-2xl border border-border p-4',
        className
      )}
      style={[shadowStyle, style]}
    >
      {children}
    </View>
  );
}
