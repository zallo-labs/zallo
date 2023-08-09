import { ExpoConfig, ConfigContext } from '@expo/config';
import { ConfigPlugin } from 'expo/config-plugins';
import { PluginConfigType as BuildPropertiesConfig } from 'expo-build-properties/build/pluginConfig';

type PluginConfig<Plugin> = Plugin extends ConfigPlugin<infer Config> ? Config : never;

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

const withVariant = (v: string) => `${v}${ENV.APP_VARIANT ? `.${ENV.APP_VARIANT}` : ''}`;

export const PROJECT_ID = 'f8f4def1-b838-4dec-8b50-6c07995c4ff5';
const packageId = withVariant('io.zallo');

// https://docs.expo.dev/versions/latest/config/app/
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: withVariant('Zallo'),
  slug: 'app',
  owner: 'zallo',
  githubUrl: CONFIG.metadata.github,
  version: '0.1.0',
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  extra: {
    ...CONFIG,
    eas: { projectId: PROJECT_ID },
  },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: 24, // 21 is Expo default, 24 is required by @ledgerhq/react-native-hid
          packagingOptions: {
            // https://github.com/margelo/react-native-quick-crypto/issues/90#issuecomment-1321129104
            pickFirst: [
              'lib/x86/libcrypto.so',
              'lib/x86_64/libcrypto.so',
              'lib/armeabi-v7a/libcrypto.so',
              'lib/arm64-v8a/libcrypto.so',
            ],
          },
        },
        ios: {
          useFrameworks: 'static', // Required by react-native-firebase
        },
      } as BuildPropertiesConfig,
    ],
    'expo-notifications', // https://docs.expo.dev/versions/latest/sdk/notifications/#configurable-properties
    'expo-localization',
    'sentry-expo',
    '@react-native-firebase/app',
    '@react-native-firebase/perf',
    '@react-native-firebase/crashlytics',
    '@config-plugins/react-native-ble-plx',
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
    googleServicesFile: withVariant('./firebase-google-services.secret.json'),
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
    googleServicesFile: withVariant('./GoogleService-Info.secret.plist'),
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  updates: {
    url: `https://u.expo.dev/${PROJECT_ID}`,
  },
});
