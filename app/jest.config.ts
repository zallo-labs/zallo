import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'jest-expo', // Runs jest-expo/ios
  // projects: [{ preset: 'jest-expo/ios' }, { preset: 'jest-expo/android' }],
  // transformIgnorePatterns: ['@sentry/.*', 'sentry-expo'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|@sentry/.*|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/src/__mocks__/svgMock.js',
  },
};

export default config;
