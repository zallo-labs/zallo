import { StyleSheet } from 'react-native';
import { Image, ImageRequireSource, View } from 'react-native';
import constants from 'expo-constants';
import { memo } from 'react';

const splash: ImageRequireSource = require('../../assets/splash.png');

function Splash_() {
  return (
    <View style={styles.container}>
      <Image source={splash} style={styles.splash} />
    </View>
  );
}

export const Splash = memo(Splash_);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: constants.expoConfig?.splash?.backgroundColor,
  },
  splash: {
    width: '100%',
    height: '100%',
    resizeMode: constants.expoConfig?.splash?.resizeMode,
  },
});
