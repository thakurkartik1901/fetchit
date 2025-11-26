import * as React from 'react';
import type { ViewProps } from 'react-native';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import { CaretDown } from './icons';
import { Text } from './text';

const accordion = tv({
  slots: {
    container: 'w-full',
    header: 'flex-row items-center justify-between py-4',
    title: 'flex-1 text-lg',
    icon: 'ml-2',
    content: 'overflow-hidden',
    divider: 'h-px bg-neutral-200 dark:bg-neutral-700',
  },
  variants: {
    variant: {
      default: {
        header: 'bg-transparent',
      },
      bordered: {
        container:
          'rounded-lg border border-neutral-200 px-4 dark:border-neutral-700',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type AccordionVariants = VariantProps<typeof accordion>;

type AccordionItemProps = ViewProps &
  AccordionVariants & {
    title: string | React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    className?: string;
    showDivider?: boolean;
    titleClassName?: string;
    dividerClassName?: string;
  };

function AccordionItem({
  title,
  children,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  variant = 'default',
  className = '',
  showDivider = true,
  titleClassName = '',
  dividerClassName = '',
  ...props
}: AccordionItemProps): React.ReactElement {
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] =
    React.useState(defaultExpanded);
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const rotation = useSharedValue(expanded ? 180 : 0);
  const styles = React.useMemo(() => accordion({ variant }), [variant]);

  React.useEffect(() => {
    rotation.value = withTiming(expanded ? 180 : 0, { duration: 200 });
  }, [expanded, rotation]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = (): void => {
    const newExpanded = !expanded;
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    onExpandedChange?.(newExpanded);
  };

  return (
    <View className={styles.container({ className })} {...props}>
      {showDivider && (
        <View className={styles.divider({ className: dividerClassName })} />
      )}
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className={styles.header()}
      >
        {typeof title === 'string' ? (
          <Text className={styles.title({ className: titleClassName })}>
            {title}
          </Text>
        ) : (
          <View className="flex-1">{title}</View>
        )}
        <Animated.View style={animatedIconStyle} className={styles.icon()}>
          <CaretDown width={20} height={20} />
        </Animated.View>
      </Pressable>
      {expanded && <View className={styles.content()}>{children}</View>}
    </View>
  );
}

type AccordionGroupProps = ViewProps & {
  children: React.ReactNode;
  allowMultiple?: boolean;
  className?: string;
};

function AccordionGroup({
  children,
  allowMultiple = true,
  className = '',
  ...props
}: AccordionGroupProps): React.ReactElement {
  const [expandedIndices, setExpandedIndices] = React.useState<Set<number>>(
    new Set()
  );

  const handleExpandedChange = (index: number, expanded: boolean): void => {
    setExpandedIndices((prev) => {
      const newSet = new Set(allowMultiple ? prev : []);
      if (expanded) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement<AccordionItemProps>(child)) {
      return React.cloneElement(child, {
        expanded: expandedIndices.has(index),
        onExpandedChange: (expanded: boolean) =>
          handleExpandedChange(index, expanded),
        showDivider: index === 0 ? child.props.showDivider : true,
      });
    }
    return child;
  });

  return (
    <View className={className} {...props}>
      {childrenWithProps}
    </View>
  );
}

export const Accordion = {
  Item: AccordionItem,
  Group: AccordionGroup,
};
