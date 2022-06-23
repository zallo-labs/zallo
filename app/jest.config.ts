import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'jest-expo', // Runs jest-expo/ios
  // projects: [{ preset: 'jest-expo/ios' }, { preset: 'jest-expo/android' }],
  transformIgnorePatterns: ['@sentry/.*', 'sentry-expo'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};

export default config;
