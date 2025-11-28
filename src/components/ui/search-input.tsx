import * as React from 'react';
import type { TextInputProps } from 'react-native';
import { I18nManager, StyleSheet, TextInput, View } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import colors from './colors';
import { Search } from './icons';

const searchInput = tv({
  slots: {
    container: 'flex-row items-center rounded-full bg-neutral-100 px-4 py-3',
    icon: 'mx-3',
    input: 'flex-1 font-inter text-base leading-5',
  },
  variants: {
    focused: {
      true: {
        container: 'items-center bg-neutral-200 dark:bg-charcoal-700',
      },
      false: {
        container: 'items-center bg-neutral-100 dark:bg-charcoal-800',
      },
    },
    size: {
      sm: {
        container: 'px-3 py-1',
        input: 'text-sm',
      },
      md: {
        container: 'px-4 py-2',
        input: 'text-base',
      },
      lg: {
        container: 'px-5 py-3',
        input: 'text-lg',
      },
    },
  },
  defaultVariants: {
    focused: false,
    size: 'md',
  },
});

type SearchInputVariants = VariantProps<typeof searchInput>;

type Props = Omit<TextInputProps, 'style'> &
  Omit<SearchInputVariants, 'focused'> & {
    className?: string;
    inputClassName?: string;
    iconColor?: string;
  };

export function SearchInput({
  placeholder = 'Search',
  size = 'md',
  className = '',
  inputClassName = '',
  iconColor,
  ...props
}: Props): React.ReactElement {
  const [isFocused, setIsFocused] = React.useState(false);

  const styles = React.useMemo(
    () => searchInput({ focused: isFocused, size }),
    [isFocused, size]
  );

  const handleFocus = React.useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      props.onFocus?.(e);
    },
    [props]
  );

  const handleBlur = React.useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      props.onBlur?.(e);
    },
    [props]
  );

  return (
    <View className={styles.container({ className })}>
      <View className={styles.icon()}>
        <Search color={iconColor ?? colors.neutral[400]} />
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        className={styles.input({ className: inputClassName })}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
        style={StyleSheet.flatten([
          { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          { textAlign: I18nManager.isRTL ? 'right' : 'left' },
        ])}
      />
    </View>
  );
}
