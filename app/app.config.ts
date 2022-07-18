import { ExpoConfig, ConfigContext } from '@expo/config';
const { CONFIG } = require('config');

// https://docs.expo.dev/versions/latest/config/app/
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'metasafe',
  slug: 'metasafe',
  version: '0.1.0',
  githubUrl: 'https://github.com/hbriese/metasafe',
  jsEngine: 'hermes',
  extra: {
    ...CONFIG,
    flipperHack: 'React Native packager is running',
  },
  plugins: ['sentry-expo', 'expo-community-flipper'],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          // https://github.com/expo/sentry-expo/blob/master/src/hooks/upload-sourcemaps.ts
          organization: CONFIG.sentry.org,
          project: CONFIG.sentry.project,
          authToken: CONFIG.sentry.authToken,
          setCommits: true,
          deployEnv: CONFIG.env,
        },
      },
    ],
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#151A30',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription:
        'This app uses the camera to scan QR codes of addresses.',
      NSFaceIDUsageDescription:
        'This app uses Face ID to authenticate the user.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#151A30',
    },
  },
  androidStatusBar: {
    barStyle: 'light-content',
  },
  web: {
    favicon: './assets/favicon.png',
  },
});
