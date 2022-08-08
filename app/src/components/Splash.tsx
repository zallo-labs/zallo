import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Box } from './Box';
import { Image, ImageRequireSource } from 'react-native';
import { SPLASH } from '~/config';
const splash: ImageRequireSource = require('../../assets/splash.png');

export const Splash = () => {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    return () => {
      SplashScreen.hideAsync();
      // setTimeout(() => SplashScreen.hideAsync(), 200);
    };
  }, []);

  return (
    <Box flex={1} backgroundColor={SPLASH?.backgroundColor}>
      <Image
        source={splash}
        style={{
          width: '100%',
          height: '100%',
          resizeMode: SPLASH?.resizeMode,
        }}
      />
    </Box>
  );
};
