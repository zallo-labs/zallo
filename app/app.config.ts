import { ExpoConfig, ConfigContext } from '@expo/config';
import { ConfigPlugin } from 'expo/config-plugins';
import { PluginConfigType as BuildPropertiesConfig } from 'expo-build-properties/build/pluginConfig';
import expoRouterPlugin from 'expo-router/plugin';
import path from 'path';

// Absolute path resolution is required for EAS builds (during gradlew autolinking), but not available for dev client
require('dotenv').config({ path: path.resolve(process.env.EAS_BUILD ? __dirname : '', '../.env') });

type PluginConfig<Plugin> = Plugin extends ConfigPlugin<infer Config> ? Config : never;

const ENV = process.env;

const vary = (value: string, f: (variant: string) => string = (v) => '.' + v) =>
  value + (ENV.APP_VARIANT ? f(ENV.APP_VARIANT) : '');

type ExternalUrl = `http:${string}`;

export const CONFIG = {
  env: ENV.RELEASE_ENV === 'development' ? 'development' : 'production',
  sentryDsn: ENV.APP_SENTRY_DSN!,
  apiUrl: ENV.API_URL!,
  apiGqlWs: ENV.API_GQL_WS!,
  walletConnectProjectId: ENV.WALLET_CONNECT_PROJECT_ID!,
  aplitudeKey: ENV.AMPLITUDE_KEY!,
  metadata: {
    iconUri: ENV.ICON_URI!,
    appStore: ENV.APP_STORE_URL! as ExternalUrl,
    playStore: ENV.PLAY_STORE_URL! as ExternalUrl,
    twitter: ENV.TWITTER! as ExternalUrl,
    github: ENV.GITHUB! as ExternalUrl,
  },
  riskRatingUrl: ENV.RISK_RATING_URL!,
  googleOAuth: {
    webClient: ENV.GOOGLE_OAUTH_WEB_CLIENT!,
    iosClient: ENV.GOOGLE_OAUTH_IOS_CLIENT!,
  },
  webAppUrl: ENV.WEB_APP_URL!,
  ensSuffix: ENV.ENS_SUFFIX!,
} as const;

export type Config = typeof CONFIG;

export const PROJECT_ID = 'f8f4def1-b838-4dec-8b50-6c07995c4ff5';
const packageId = vary('io.zallo');

// https://docs.expo.dev/versions/latest/config/app/
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: vary('Zallo', (v) => ` (${v})`),
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
          minSdkVersion: 24, // 23 is Expo default, 24 is required by @ledgerhq/react-native-hid
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
      } as BuildPropertiesConfig,
    ],
    ['expo-router', { origin: CONFIG.webAppUrl } as PluginConfig<typeof expoRouterPlugin>],
    ['expo-font', { fonts: ['./assets/fonts/Roboto-Medium.ttf', 'assets/fonts/Roboto.ttf'] }],
    'expo-notifications', // https://docs.expo.dev/versions/latest/sdk/notifications/#configurable-properties
    'expo-localization',
    [
      '@sentry/react-native/expo',
      {
        organization: ENV.SENTRY_ORG,
        project: ENV.APP_SENTRY_PROJECT,
        deployEnv: ENV.env,
        authToken: ENV.SENTRY_AUTH_TOKEN, // Not read from env for some reason
      },
    ],
    'expo-camera',
    'react-native-ble-plx',
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: ENV.GOOGLE_OAUTH_IOS_URL_SCHEME ?? '',
      },
    ],
    'expo-apple-authentication',
    [
      'react-native-cloud-storage',
      { iCloudContainerEnvironment: CONFIG.env === 'development' ? 'Development' : 'Production' },
    ],
  ],
  orientation: 'portrait',
  icon: './assets/icon@2x.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFBFE',
  },
  primaryColor: '#6750A4', // primary (light)
  assetBundlePatterns: ['**/*'],
  scheme: 'zallo',
  android: {
    package: packageId,
    adaptiveIcon: {
      foregroundImage: './assets/icon-adaptive.png',
      backgroundColor: '#E8DEF8',
    },
    googleServicesFile:
      ENV[vary('GOOGLE_SERVICES_ANDROID_FILE', (v) => '_' + v.toUpperCase())] ||
      vary('./google-services-android.secret.json'),
    playStoreUrl: ENV.PLAY_STORE_URL,
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
    usesAppleSignIn: true,
    infoPlist: {
      NSCameraUsageDescription: 'Allow Zallo to use the camera to scan QR codes.',
      NSFaceIDUsageDescription: 'Allow Zallo to (optionally) use Face ID for authentication.',
    },
    config: {
      usesNonExemptEncryption: false,
    },
    googleServicesFile:
      ENV[vary('GOOGLE_SERVICES_IOS_FILE', (v) => '_' + v.toUpperCase())] ||
      vary('./google-services-ios.secret.plist'),
    // appStoreUrl: ENV.APP_STORE_URL,
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  experiments: {
    typedRoutes: true,
  },
  updates: {
    url: `https://u.expo.dev/${PROJECT_ID}`,
  },
});
