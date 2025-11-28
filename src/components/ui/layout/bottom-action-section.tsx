/* eslint-disable max-lines-per-function */
import { View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

import { SHADOWS } from '@/lib/shadows';

import { Button, type ButtonVariant } from '../core/button';

type ButtonConfig = {
  text: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
};

type ShadowVariant = 'default' | 'none' | 'border';

type BottomActionSectionProps = {
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
  children?: React.ReactNode;
  shadow?: ShadowVariant;
  backgroundColor?: string;
  safeAreaPadding?: number;
  minPadding?: number;
  className?: string;
  style?: any;
};

export function BottomActionSection({
  primaryButton,
  secondaryButton,
  children,
  shadow = 'default',
  backgroundColor = Colors.panther.white,
  safeAreaPadding = 4,
  minPadding,
  className,
  style,
}: BottomActionSectionProps) {
  const insets = useSafeAreaInsets();

  const bottomPadding = minPadding
    ? Math.max(insets.bottom + safeAreaPadding, minPadding)
    : insets.bottom + safeAreaPadding;

  const shadowStyle =
    shadow === 'default'
      ? SHADOWS.bottomFloating
      : shadow === 'border'
        ? { borderTopWidth: 1, borderTopColor: Colors.border.default }
        : {};

  return (
    <View
      className={twMerge('absolute bottom-0 left-0 right-0 pt-4', className)}
      style={[
        { backgroundColor, paddingBottom: bottomPadding },
        shadowStyle,
        style,
      ]}
    >
      {children}

      {(primaryButton || secondaryButton) && (
        <View className="flex-row gap-3 px-6">
          {secondaryButton && (
            <View className="flex-1">
              <Button
                variant={secondaryButton.variant || 'default'}
                size="lg"
                fullWidth
                onPress={secondaryButton.onPress}
                loading={secondaryButton.loading}
                disabled={secondaryButton.disabled}
              >
                {secondaryButton.text}
              </Button>
            </View>
          )}

          {primaryButton && (
            <View className={secondaryButton ? 'flex-1' : 'flex-1'}>
              <Button
                variant={primaryButton.variant || 'default'}
                size="lg"
                fullWidth
                onPress={primaryButton.onPress}
                loading={primaryButton.loading}
                disabled={primaryButton.disabled}
              >
                {primaryButton.text}
              </Button>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
