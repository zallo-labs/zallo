import { Image, ImageRequireSource, StyleSheet, View } from 'react-native';
import constants from 'expo-constants';

const splash: ImageRequireSource = require('../../assets/splash.png');

export const Splash = () => (
  <View style={styles.container}>
    <Image source={splash} style={styles.splash} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: constants.expoConfig?.splash?.backgroundColor,
  },
  splash: {
    width: '100%',
    height: '100%',
    resizeMode: constants.expoConfig?.splash?.resizeMode,
  },
});
