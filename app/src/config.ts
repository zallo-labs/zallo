import constants from 'expo-constants';
import type { Config } from 'config';

export const CONFIG = constants.manifest?.extra as Config;

export const IS_DEV = CONFIG.environment === 'development';
