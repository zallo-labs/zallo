import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

export const ShowSplash = () => {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  return null;
};
