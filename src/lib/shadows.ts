import { Platform, type ViewStyle } from 'react-native';

import { colors } from '@/components/ui/tokens';

/**
 * Centralized shadow styles for consistent elevation
 */

export const SHADOWS = {
  // Search bar shadow
  searchBar: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    android: {
      elevation: 3,
    },
  }) as ViewStyle,

  // Card shadow (subtle)
  card: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }) as ViewStyle,

  // Card shadow (soft)
  cardSoft: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }) as ViewStyle,

  // Bottom floating shadow (upward)
  bottomFloating: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }) as ViewStyle,

  // Button shadow
  button: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    android: {
      elevation: 3,
    },
  }) as ViewStyle,
} as const;
