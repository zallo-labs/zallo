import { Platform } from 'react-native';
import { useEffect } from 'react';
import * as ExpoNavigationBar from 'expo-navigation-bar';

export const HideNavigationBar = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      ExpoNavigationBar.setVisibilityAsync('hidden');

      return () => {
        ExpoNavigationBar.setVisibilityAsync('visible');
      };
    }
  }, []);

  return null;
};
