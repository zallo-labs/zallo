import { ExpoConfig, ConfigContext } from '@expo/config';

const ENV = process.env;

const chain = ENV?.CHAIN?.toUpperCase();
export const CONFIG = {
  env: ENV.RELEASE_ENV === 'development' ? 'development' : 'production',
  chainName: chain!,
  sentryDsn: ENV.SENTRY_DSN!,
  apiUrl: ENV.API_URL!,
  apiGqlWs: ENV.API_GQL_WS!,
  subgraphGqlUrl: ENV.SUBGRAPH_GQL_URL!,
  walletConnectProjectId: '599f2bebcaf0baedaaf87f899ad27991',
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
  githubUrl: 'https://github.com/zallo-labs/zallo',
  jsEngine: 'hermes',
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
    [
      'expo-community-flipper',
      {
        // https://github.com/jakobo/expo-community-flipper#configuration
        ios: {
          enabled: false, // Disable on ios due to issue https://github.com/jakobo/expo-community-flipper/issues/27
          // stripUseFrameworks: true,  // Alternative to disabling on ios, but enabling may break other packages
        },
      },
    ],
    'expo-notifications', // https://docs.expo.dev/versions/latest/sdk/notifications/#configuration-in-appjson--appconfigjs
  ],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          // https://docs.expo.dev/guides/using-sentry/#31-configure-a--postpublish--hook
          organization: ENV.SENTRY_ORG,
          project: ENV.SENTRY_PROJECT,
          authToken: ENV.SENTRY_AUTH_TOKEN,
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
    backgroundColor: '#E8DEF8',
  },
  assetBundlePatterns: ['**/*'],
  scheme: 'zallo',
  android: {
    package: packageId,
    adaptiveIcon: {
      foregroundImage: './assets/icon-adaptive@2x.png',
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
  },
  web: {
    favicon: './assets/favicon.png',
  },
  updates: {
    url: `https://u.expo.dev/${PROJECT_ID}`,
  },
});
