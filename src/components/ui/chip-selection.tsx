import * as React from 'react';
import type { ViewProps } from 'react-native';
import { Pressable, ScrollView, View } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import { Text } from './text';

const chip = tv({
  slots: {
    container: '',
    chip: 'items-center justify-center rounded-full px-5 py-2.5',
    label: 'font-inter-semibold text-sm uppercase tracking-wide',
  },
  variants: {
    layout: {
      scroll: {
        container: 'flex-row',
      },
      wrap: {
        container: 'flex-row flex-wrap',
      },
    },
    selected: {
      true: {
        chip: 'bg-primary-600',
        label: 'text-white',
      },
      false: {
        chip: 'bg-primary-50 dark:bg-charcoal-800',
        label: 'text-primary-600 dark:text-primary-400',
      },
    },
    size: {
      sm: {
        chip: 'px-3 py-1.5',
        label: 'text-xs',
      },
      md: {
        chip: 'px-5 py-2.5',
        label: 'text-sm',
      },
      lg: {
        chip: 'px-6 py-3',
        label: 'text-base',
      },
    },
  },
  defaultVariants: {
    layout: 'wrap',
    selected: false,
    size: 'md',
  },
});

type ChipVariants = VariantProps<typeof chip>;

type ChipOption = {
  label: string;
  value: string;
};

type BaseChipSelectionProps = Omit<ViewProps, 'children'> &
  Omit<ChipVariants, 'selected'> & {
    options: ChipOption[];
    className?: string;
    chipClassName?: string;
    labelClassName?: string;
    gap?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
  };

type SingleChipSelectionProps = BaseChipSelectionProps & {
  mode: 'single';
  value: string | null;
  onChange: (value: string) => void;
};

type MultipleChipSelectionProps = BaseChipSelectionProps & {
  mode: 'multiple';
  value: string[];
  onChange: (value: string[]) => void;
};

type ChipSelectionProps = SingleChipSelectionProps | MultipleChipSelectionProps;

const gapStyles = {
  sm: 'gap-1.5',
  md: 'gap-2.5',
  lg: 'gap-3',
} as const;

type ChipItemProps = {
  option: ChipOption;
  selected: boolean;
  size: ChipVariants['size'];
  chipClassName?: string;
  labelClassName?: string;
  onPress: () => void;
  disabled?: boolean;
};

function ChipItem({
  option,
  selected,
  size,
  chipClassName,
  labelClassName,
  onPress,
  disabled,
}: ChipItemProps): React.ReactElement {
  const styles = React.useMemo(
    () => chip({ selected, size }),
    [selected, size]
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={option.label}
      className={styles.chip({ className: chipClassName })}
    >
      <Text className={styles.label({ className: labelClassName })}>
        {option.label}
      </Text>
    </Pressable>
  );
}

function getIsSelected(
  mode: 'single' | 'multiple',
  value: string | null | string[],
  optionValue: string
): boolean {
  if (mode === 'single') return value === optionValue;
  return (value as string[]).includes(optionValue);
}

type ChipPressParams = {
  mode: 'single' | 'multiple';
  value: string | null | string[];
  optionValue: string;
  onChange: ((v: string) => void) | ((v: string[]) => void);
};

function handleChipPress({
  mode,
  value,
  optionValue,
  onChange,
}: ChipPressParams): void {
  if (mode === 'single') {
    (onChange as (v: string) => void)(optionValue);
  } else {
    const currentValues = value as string[];
    const isSelected = currentValues.includes(optionValue);
    const newValues = isSelected
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];
    (onChange as (v: string[]) => void)(newValues);
  }
}

export function ChipSelection({
  mode,
  options,
  value,
  onChange,
  layout = 'wrap',
  size = 'md',
  className = '',
  chipClassName = '',
  labelClassName = '',
  gap = 'md',
  disabled = false,
  ...props
}: ChipSelectionProps): React.ReactElement {
  const styles = React.useMemo(() => chip({ layout, size }), [layout, size]);
  const gapClass = gapStyles[gap];

  const chips = options.map((option) => (
    <ChipItem
      key={option.value}
      option={option}
      selected={getIsSelected(mode, value, option.value)}
      size={size}
      chipClassName={chipClassName}
      labelClassName={labelClassName}
      onPress={() =>
        !disabled &&
        handleChipPress({ mode, value, optionValue: option.value, onChange })
      }
      disabled={disabled}
    />
  ));

  if (layout === 'scroll') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName={styles.container({ className: gapClass })}
        {...props}
      >
        {chips}
      </ScrollView>
    );
  }

  return (
    <View
      className={styles.container({ className: `${gapClass} ${className}` })}
      accessibilityRole="radiogroup"
      {...props}
    >
      {chips}
    </View>
  );
}
