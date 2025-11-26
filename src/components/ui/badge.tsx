import * as React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import { Text } from './text';

const badge = tv({
  slots: {
    container: 'items-center justify-center rounded-full',
    label: 'text-center font-inter font-semibold',
  },
  variants: {
    variant: {
      primary: {
        container: 'bg-primary-600',
        label: 'text-white',
      },
      success: {
        container: 'bg-success-500',
        label: 'text-white',
      },
      warning: {
        container: 'bg-warning-500',
        label: 'text-white',
      },
      danger: {
        container: 'bg-danger-500',
        label: 'text-white',
      },
      neutral: {
        container: 'bg-neutral-400',
        label: 'text-white',
      },
    },
    size: {
      sm: {
        container: 'size-5',
        label: 'text-[10px]',
      },
      md: {
        container: 'size-6',
        label: 'text-xs',
      },
      lg: {
        container: 'size-8',
        label: 'text-sm',
      },
    },
    type: {
      number: {},
      icon: {},
      dot: {
        container: 'size-3',
      },
    },
  },
  compoundVariants: [
    {
      type: 'dot',
      size: 'sm',
      class: {
        container: 'size-2',
      },
    },
    {
      type: 'dot',
      size: 'md',
      class: {
        container: 'size-3',
      },
    },
    {
      type: 'dot',
      size: 'lg',
      class: {
        container: 'size-4',
      },
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    type: 'dot',
  },
});

const iconColors = {
  primary: '#ffffff',
  success: '#ffffff',
  warning: '#ffffff',
  danger: '#ffffff',
  neutral: '#ffffff',
} as const;

const iconSizes = {
  sm: 10,
  md: 14,
  lg: 18,
} as const;

type BadgeVariants = VariantProps<typeof badge>;

type BaseBadgeProps = Omit<ViewProps, 'children'> &
  Omit<BadgeVariants, 'type'> & {
    className?: string;
  };

type NumberBadgeProps = BaseBadgeProps & {
  type: 'number';
  value: number;
  maxValue?: number;
  icon?: never;
};

type IconBadgeProps = BaseBadgeProps & {
  type: 'icon';
  icon?: React.ReactNode;
  value?: never;
  maxValue?: never;
};

type DotBadgeProps = BaseBadgeProps & {
  type: 'dot';
  value?: never;
  maxValue?: never;
  icon?: never;
};

type BadgeProps = NumberBadgeProps | IconBadgeProps | DotBadgeProps;

const CheckIcon = ({
  size,
  color,
}: {
  size: number;
  color: string;
}): React.ReactElement => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

function formatBadgeValue(value: number, maxValue?: number): string {
  if (maxValue && value > maxValue) {
    return `${maxValue}+`;
  }
  return String(value);
}

export function Badge({
  type,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: BadgeProps): React.ReactElement {
  const styles = React.useMemo(
    () => badge({ variant, size, type }),
    [variant, size, type]
  );

  const iconColor = iconColors[variant ?? 'primary'];
  const iconSize = iconSizes[size ?? 'md'];

  if (type === 'dot') {
    return (
      <View
        className={styles.container({ className })}
        accessibilityRole="none"
        {...props}
      />
    );
  }

  if (type === 'number') {
    const { value, maxValue } = props as NumberBadgeProps;
    return (
      <View
        className={styles.container({ className })}
        accessibilityRole="text"
        accessibilityLabel={`${value} notifications`}
        {...props}
      >
        <Text className={styles.label()}>
          {formatBadgeValue(value, maxValue)}
        </Text>
      </View>
    );
  }

  if (type === 'icon') {
    const { icon } = props as IconBadgeProps;
    return (
      <View
        className={styles.container({ className })}
        accessibilityRole="image"
        {...props}
      >
        {icon ?? <CheckIcon size={iconSize} color={iconColor} />}
      </View>
    );
  }

  return (
    <View
      className={styles.container({ className })}
      accessibilityRole="none"
      {...props}
    />
  );
}
