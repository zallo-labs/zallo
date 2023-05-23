import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as ExpoNavigationBar from 'expo-navigation-bar';
import { useTheme } from '@theme/paper';

export const NavigationBar = () => {
  const { dark, colors } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      ExpoNavigationBar.setBackgroundColorAsync(colors.background);
      ExpoNavigationBar.setButtonStyleAsync(dark ? 'light' : 'dark');
    }
  }, []);

  return null;
};
