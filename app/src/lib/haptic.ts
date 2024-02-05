import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { match } from 'ts-pattern';

export type HapticFeedbackType = 'selection' | 'neutral' | 'success' | 'warning' | 'error';

export const hapticFeedback = Platform.select({ default: web, native });

const patterns: Record<HapticFeedbackType, VibratePattern> = {
  selection: 10,
  neutral: 20,
  success: [20, 100, 20],
  warning: [40, 120, 60],
  error: [60, 100, 40, 80, 50],
};

function web(type: HapticFeedbackType) {
  if ('vibrate' in navigator) navigator.vibrate(patterns[type]);
}

function native(type: HapticFeedbackType) {
  return match(type)
    .with('selection', () => Haptics.selectionAsync()) // Equivalent to Haptics.ImpactFeedbackStyle.Light
    .with('neutral', () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium))
    .with('success', () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
    .with('warning', () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning))
    .with('error', () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))
    .exhaustive();
}
