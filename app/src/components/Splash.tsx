import { StyleSheet } from 'react-native';
import { Image, ImageRequireSource, View } from 'react-native';
import { SPLASH } from '~/util/config';
const splash: ImageRequireSource = require('../../assets/splash.png');

export const Splash = () => (
  <View style={styles.container}>
    <Image source={splash} style={styles.splash} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH?.backgroundColor,
  },
  splash: {
    width: '100%',
    height: '100%',
    resizeMode: SPLASH?.resizeMode,
  },
});
