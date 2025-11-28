/* eslint-disable max-lines-per-function */
import { useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Animation presets and utilities
 */

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export const EASING = {
  linear: Easing.linear,
  ease: Easing.ease,
  elastic: Easing.elastic(1),
  bounce: Easing.bounce,
  bezier: Easing.bezier(0.25, 0.1, 0.25, 1),
} as const;

/**
 * Hook for common animations
 */
export function useAnimations() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = (duration = ANIMATION_DURATION.normal) => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = (duration = ANIMATION_DURATION.normal) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const scaleUp = (duration = ANIMATION_DURATION.fast) => {
    Animated.timing(scaleAnim, {
      toValue: 1.1,
      duration,
      easing: EASING.ease,
      useNativeDriver: true,
    }).start();
  };

  const scaleDown = (duration = ANIMATION_DURATION.fast) => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      easing: EASING.ease,
      useNativeDriver: true,
    }).start();
  };

  const slideUp = (duration = ANIMATION_DURATION.normal) => {
    Animated.timing(translateYAnim, {
      toValue: -20,
      duration,
      easing: EASING.ease,
      useNativeDriver: true,
    }).start();
  };

  const slideDown = (duration = ANIMATION_DURATION.normal) => {
    Animated.timing(translateYAnim, {
      toValue: 0,
      duration,
      easing: EASING.ease,
      useNativeDriver: true,
    }).start();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(translateYAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const bounce = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        easing: EASING.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: EASING.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    fadeAnim,
    scaleAnim,
    translateYAnim,
    fadeIn,
    fadeOut,
    scaleUp,
    scaleDown,
    slideUp,
    slideDown,
    shake,
    pulse,
    bounce,
  };
}
