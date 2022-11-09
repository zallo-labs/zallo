import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Box } from '~/components/layout/Box';
import { Image, ImageRequireSource } from 'react-native';
import { SPLASH } from '~/util/config';
const splash: ImageRequireSource = require('../../assets/splash@1290x2796.png');

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
