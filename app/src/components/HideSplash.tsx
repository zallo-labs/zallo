import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';

export const HideSplash = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return null;
};
