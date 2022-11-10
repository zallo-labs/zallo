import { ExpoConfig, ConfigContext } from '@expo/config';

const E = process.env;

const chain = E?.CHAIN?.toUpperCase();
export const CONFIG = {
  env: E.RELEASE_ENV === 'development' ? 'development' : 'production',
  chainName: chain!,
  sentryDsn: E.SENTRY_DSN!,
  apiUrl: E.API_URL!,
  subgraphGqlUrl: E.SUBGRAPH_GQL_URL!,
  proxyFactory: E[`PROXY_FACTORY_${chain}`]!,
  accountImpl: E[`ACCOUNT_IMPL_${chain}`]!,
  multiCall: E[`MULTI_CALL_${chain}`]!,
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
    'expo-community-flipper',
    'expo-notifications', // https://docs.expo.dev/versions/latest/sdk/notifications/#configuration-in-appjson--appconfigjs
  ],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          // https://docs.expo.dev/guides/using-sentry/#31-configure-a--postpublish--hook
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
  icon: './assets/icon-rounded@1024.png',
  splash: {
    image: './assets/splash@1290x2796.png',
    resizeMode: 'contain',
    backgroundColor: '#E8DEF8',
  },
  assetBundlePatterns: ['**/*'],
  scheme: 'zallo',
  android: {
    package: packageId,
    adaptiveIcon: {
      foregroundImage: './assets/icon-adaptive@1024.png',
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
    favicon: './assets/icon-rounded@64.png',
  },
  updates: {
    url: `https://u.expo.dev/${PROJECT_ID}`,
  },
});
