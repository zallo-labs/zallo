import constants from 'expo-constants';
import type { Config } from '../../app.config';
import { Platform } from 'react-native';

export const CONFIG = constants.expoConfig!.extra as Config;

export const SCHEME = Array.isArray(constants.expoConfig?.scheme)
  ? constants.expoConfig?.scheme[0]
  : constants.expoConfig?.scheme;

export const __WEB__ = Platform.OS === 'web';
