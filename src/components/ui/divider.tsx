import * as React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import { Text } from './text';

const divider = tv({
  slots: {
    container: 'items-center justify-center',
    line: '',
    label: 'font-inter text-neutral-500 dark:text-neutral-400',
  },
  variants: {
    orientation: {
      horizontal: {
        container: 'w-full flex-row',
        line: 'h-px flex-1',
      },
      vertical: {
        container: 'h-full flex-col',
        line: 'w-px flex-1',
      },
    },
    variant: {
      default: {
        line: 'bg-neutral-200 dark:bg-neutral-700',
      },
      muted: {
        line: 'bg-neutral-100 dark:bg-neutral-800',
      },
      strong: {
        line: 'bg-neutral-400 dark:bg-neutral-500',
      },
      primary: {
        line: 'bg-primary-600',
      },
      danger: {
        line: 'bg-danger-500',
      },
      success: {
        line: 'bg-success-500',
      },
    },
    thickness: {
      thin: {},
      default: {},
      thick: {},
    },
    style: {
      solid: {},
      dashed: {
        line: 'border-dashed',
      },
      dotted: {
        line: 'border-dotted',
      },
    },
  },
  compoundVariants: [
    // Horizontal thickness variants
    {
      orientation: 'horizontal',
      thickness: 'thin',
      class: {
        line: 'h-px',
      },
    },
    {
      orientation: 'horizontal',
      thickness: 'default',
      class: {
        line: 'h-[1.5px]',
      },
    },
    {
      orientation: 'horizontal',
      thickness: 'thick',
      class: {
        line: 'h-[2px]',
      },
    },
    // Vertical thickness variants
    {
      orientation: 'vertical',
      thickness: 'thin',
      class: {
        line: 'w-px',
      },
    },
    {
      orientation: 'vertical',
      thickness: 'default',
      class: {
        line: 'w-[1.5px]',
      },
    },
    {
      orientation: 'vertical',
      thickness: 'thick',
      class: {
        line: 'w-[2px]',
      },
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'default',
    thickness: 'default',
    style: 'solid',
  },
});

type DividerVariants = VariantProps<typeof divider>;

type Props = ViewProps &
  DividerVariants & {
    className?: string;
    lineClassName?: string;
    label?: string;
    labelClassName?: string;
  };

export function Divider({
  orientation = 'horizontal',
  variant = 'default',
  thickness = 'default',
  style = 'solid',
  className = '',
  lineClassName = '',
  label,
  labelClassName = '',
  ...props
}: Props): React.ReactElement {
  const styles = React.useMemo(
    () => divider({ orientation, variant, thickness, style }),
    [orientation, variant, thickness, style]
  );

  const hasLabel = Boolean(label) && orientation === 'horizontal';

  if (hasLabel) {
    return (
      <View
        className={styles.container({ className })}
        accessibilityRole="none"
        {...props}
      >
        <View className={styles.line({ className: lineClassName })} />
        <Text
          className={styles.label({
            className: `px-3 text-sm ${labelClassName}`,
          })}
        >
          {label}
        </Text>
        <View className={styles.line({ className: lineClassName })} />
      </View>
    );
  }

  return (
    <View
      className={styles.container({ className })}
      accessibilityRole="none"
      {...props}
    >
      <View className={styles.line({ className: lineClassName })} />
    </View>
  );
}
