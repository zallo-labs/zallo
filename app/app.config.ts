import { ExpoConfig, ConfigContext } from '@expo/config';

const ENV = process.env;

const chain = ENV?.CHAIN?.toUpperCase();
export const CONFIG = {
  env: ENV.RELEASE_ENV === 'development' ? 'development' : 'production',
  chainName: chain!,
  sentryDsn: ENV.APP_SENTRY_DSN!,
  apiUrl: ENV.API_URL!,
  apiGqlWs: ENV.API_GQL_WS!,
  walletConnectProjectId: ENV.WALLET_CONNECT_PROJECT_ID!,
  metadata: {
    site: ENV.SITE!,
    iconUri: ENV.ICON_URI!,
    twitter: ENV.TWITTER!,
    github: ENV.GITHUB!,
  },
} as const;

export type Config = typeof CONFIG;

export const PROJECT_ID = 'f8f4def1-b838-4dec-8b50-6c07995c4ff5';
const packageId = 'io.zallo';

// https://docs.expo.dev/versions/latest/config/app/
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Zallo',
  slug: 'app',
  owner: 'zallo',
  githubUrl: CONFIG.metadata.github,
  version: '0.1.0',
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  extra: {
    ...CONFIG,
    ...(CONFIG.env === 'production' && { eas: { projectId: PROJECT_ID } }),
  },
  plugins: [
    'sentry-expo',
    'expo-notifications', // https://docs.expo.dev/versions/latest/sdk/notifications/#configurable-properties
    [
      'expo-build-properties',
      {
        android: {
          unstable_networkInspector: true,
        },
        // https://docs.expo.dev/versions/latest/sdk/build-properties/
        ios: {
          unstable_networkInspector: true,
          useFrameworks: 'static', // Required by react-native-firebase
          // flipper: false, // Disallowed by `useFrameworks: 'static'` https://github.com/jakobo/expo-community-flipper/issues/27
        },
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/perf',
    '@react-native-firebase/crashlytics',
  ],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          // https://docs.expo.dev/guides/using-sentry/#31-configure-a--postpublish--hook
          organization: ENV.SENTRY_ORG,
          project: ENV.APP_SENTRY_PROJECT,
          // authToken: ENV.SENTRY_AUTH_TOKEN,  // Hook reads SENTRY_AUTH_TOKEN env
          deployEnv: ENV.env,
          setCommits: true,
        },
      },
    ],
  },
  orientation: 'portrait',
  icon: './assets/icon@2x.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFBFE',
  },
  assetBundlePatterns: ['**/*'],
  scheme: 'zallo',
  android: {
    package: packageId,
    adaptiveIcon: {
      foregroundImage: './assets/icon-adaptive.png',
      backgroundColor: '#E8DEF8',
    },
    googleServicesFile: './firebase-google-services.secret.json',
  },
  androidStatusBar: {
    backgroundColor: '#00000000', // Transparent
  },
  androidNavigationBar: {
    backgroundColor: '#FFFBFE',
  },
  ios: {
    bundleIdentifier: packageId,
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: 'Allow Zallo to use the camera to scan QR codes.',
      NSFaceIDUsageDescription: 'Allow Zallo to (optionally) use Face ID for authentication.',
    },
    config: {
      usesNonExemptEncryption: false,
    },
    googleServicesFile: './GoogleService-Info.secret.plist',
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  updates: {
    url: `https://u.expo.dev/${PROJECT_ID}`,
  },
});
