import { ExpoConfig, ConfigContext } from '@expo/config';

const ENV = process.env;

const chain = ENV?.CHAIN?.toUpperCase();
export const CONFIG = {
  env: ENV.RELEASE_ENV === 'development' ? 'development' : 'production',
  chainName: chain!,
  sentryDsn: ENV.SENTRY_DSN!,
  apiUrl: ENV.API_URL!,
  apiGqlWs: ENV.API_GQL_WS!,
  walletConnectProjectId: '599f2bebcaf0baedaaf87f899ad27991',
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
        // https://docs.expo.dev/versions/latest/sdk/build-properties/
        ios: {
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
          project: ENV.SENTRY_PROJECT,
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
  ios: {
    bundleIdentifier: packageId,
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription:
        'This app uses the camera to scan QR codes of addresses and to connect to DApps.',
      NSFaceIDUsageDescription: 'This app uses Face ID to authenticate the user.',
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
