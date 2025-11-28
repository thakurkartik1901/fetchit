import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities
 */

export const haptics = {
  /**
   * Light haptic feedback (subtle tap)
   */
  light: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Medium haptic feedback (standard tap)
   */
  medium: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Heavy haptic feedback (strong tap)
   */
  heavy: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Success haptic feedback
   */
  success: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Warning haptic feedback
   */
  warning: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * Error haptic feedback
   */
  error: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Selection haptic feedback (for toggles, switches)
   */
  selection: async () => {
    await Haptics.selectionAsync();
  },
};
