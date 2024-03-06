import { SplashScreen } from 'expo-router';
import { loadAsync } from 'expo-font';
import { logError } from '~/util/analytics';

const FONTS = {
  Roboto: require('assets/fonts/Roboto.ttf'),
  'Roboto-Medium': require('assets/fonts/Roboto-Medium.ttf'),
} as const;

SplashScreen.preventAutoHideAsync();

export function Fonts() {
  loadAsync(FONTS)
    .catch((error) => logError('Failed to load fonts', { error }))
    .finally(SplashScreen.hideAsync);

  return null;
}
