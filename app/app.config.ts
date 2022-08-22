import { ExpoConfig, ConfigContext } from '@expo/config';

const E = process.env;

const chain = E?.CHAIN?.toUpperCase();
export const CONFIG = {
  env: E.NODE_ENV === 'development' ? 'development' : 'production',
  chainName: chain,
  sentryDsn: E.SENTRY_DSN!,
  apiUrl: E.API_URL!,
  subgraphGqlUrl: E.SUBGRAPH_GQL_URL!,
  proxyFactory: E[`PROXY_FACTORY_${chain}`]!,
  accountImpl: E[`ACCOUNT_IMPL_${chain}`]!,
  multiCall: E[`MULTI_CALL_${chain}`]!,
} as const;

export type Config = typeof CONFIG;

// https://docs.expo.dev/versions/latest/config/app/
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'AlloPay',
  slug: 'app',
  owner: 'allopay',
  githubUrl: 'https://github.com/allopay/allopay',
  jsEngine: 'hermes',
  version: '0.1.0',
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  extra: CONFIG,
  plugins: ['sentry-expo', 'expo-community-flipper'],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          // https://github.com/expo/sentry-expo/blob/master/src/hooks/upload-sourcemaps.ts
          organization: E.SENTRY_ORG,
          project: E.SENTRY_PROJECT,
          authToken: E.SENTRY_AUTH_TOKEN,
          deployEnv: E.env,
          setCommits: true,
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
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'io.allopay',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#151A30',
    },
  },
  ios: {
    bundleIdentifier: 'io.allopay',
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription:
        'This app uses the camera to scan QR codes of addresses.',
      NSFaceIDUsageDescription:
        'This app uses Face ID to authenticate the user.',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  updates: {
    url: 'https://u.expo.dev/f8f4def1-b838-4dec-8b50-6c07995c4ff5',
  },
});
