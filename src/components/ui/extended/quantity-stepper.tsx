/* eslint-disable max-lines-per-function */
import React from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { haptics } from '@/lib/haptics';

import { Text } from '../core/text';

type QuantityStepperProps = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeStyles = {
  sm: {
    container: 'h-8',
    button: 'w-8 h-8',
    text: 'text-sm',
  },
  md: {
    container: 'h-10',
    button: 'w-10 h-10',
    text: 'text-base',
  },
  lg: {
    container: 'h-12',
    button: 'w-12 h-12',
    text: 'text-lg',
  },
};

export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const canDecrement = value > min;
  const canIncrement = max === undefined || value < max;

  const handleDecrement = () => {
    if (canDecrement) {
      haptics.light();
      onDecrement();
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      haptics.light();
      onIncrement();
    }
  };

  return (
    <View
      className={twMerge(
        'flex-row items-center rounded-xl border border-border bg-surface',
        sizeStyles[size].container,
        className
      )}
    >
      {/* Decrement Button */}
      <Pressable
        onPress={handleDecrement}
        disabled={!canDecrement}
        className={twMerge(
          'items-center justify-center rounded-l-xl border-r border-border',
          sizeStyles[size].button,
          !canDecrement && 'opacity-30'
        )}
        style={({ pressed }) => ({
          opacity: pressed && canDecrement ? 0.6 : 1,
        })}
      >
        <Text className="text-panther-green font-inter-bold text-2xl">−</Text>
      </Pressable>

      {/* Value Display */}
      <View className="flex-1 items-center justify-center">
        <Text className={twMerge('font-inter-semibold', sizeStyles[size].text)}>
          {value}
        </Text>
      </View>

      {/* Increment Button */}
      <Pressable
        onPress={handleIncrement}
        disabled={!canIncrement}
        className={twMerge(
          'items-center justify-center rounded-r-xl border-l border-border',
          sizeStyles[size].button,
          !canIncrement && 'opacity-30'
        )}
        style={({ pressed }) => ({
          opacity: pressed && canIncrement ? 0.6 : 1,
        })}
      >
        <Text className="text-panther-green font-inter-bold text-2xl">+</Text>
      </Pressable>
    </View>
  );
}
