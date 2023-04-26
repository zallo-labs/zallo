import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

export const HideSplash = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return null;
};
